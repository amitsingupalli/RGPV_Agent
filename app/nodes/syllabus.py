import re
from typing import Optional
from pydantic import BaseModel, Field, field_validator


class TopicItem(BaseModel):
    id: Optional[str] = None
    title: str = Field(description="Title of the topic")
    subtopics: list[str] = Field(default_factory=list, description="Granular subtopics under this topic")
    source_refs: list[str] = Field(min_length=1, description="Source page references, e.g. ['doc_123:p1']")

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 3:
            raise ValueError("Topic title must be at least 3 characters")
        return v


class SyllabusUnit(BaseModel):
    unit_number: int = Field(ge=1, le=10, description="Unit number (e.g. 1 to 5)")
    unit_name: str = Field(description="Name or heading of the unit")
    topics: list[TopicItem] = Field(min_length=1, description="List of topics in the unit")


class ExtractedSyllabus(BaseModel):
    subject_name: str = Field(description="Name of the subject, e.g. Database Management Systems")
    subject_code: Optional[str] = Field(default=None, description="Official subject code, e.g. CS-403")
    branch: Optional[str] = Field(default="Computer Science & Engineering")
    semester: Optional[int] = Field(default=4)
    units: list[SyllabusUnit] = Field(min_length=1, description="Units in syllabus")

    @field_validator("units")
    @classmethod
    def validate_units(cls, units: list[SyllabusUnit]) -> list[SyllabusUnit]:
        unit_nums = [u.unit_number for u in units]
        if len(unit_nums) != len(set(unit_nums)):
            raise ValueError("Duplicate unit numbers found in syllabus")
        return units


class SyllabusParserEngine:
    """Deterministic and schema-validated syllabus extractor."""

    UNIT_REGEX = re.compile(
        r"^unit[-:\s]*(?:(viii|vii|vi|iv|v|ix|x|iii|ii|i)|(\d+))(?:\s*[:\.-]|\s+)",
        re.IGNORECASE
    )

    ROMAN_MAP = {
        "i": 1, "ii": 2, "iii": 3, "iv": 4, "v": 5,
        "vi": 6, "vii": 7, "viii": 8, "ix": 9, "x": 10
    }

    @classmethod
    def parse_raw_text(
        cls,
        pages: list[dict],
        subject_name: str = "Database Management Systems",
        subject_code: str = "CS-403"
    ) -> ExtractedSyllabus:
        units_dict: dict[int, dict] = {}

        for page in pages:
            page_no = page.get("page_number", 1)
            doc_id = page.get("doc_id", "syllabus_doc")
            text = page.get("text", "")
            source_ref = f"{doc_id}:p{page_no}"

            lines = text.split("\n")
            current_unit_no: Optional[int] = None
            current_buffer: list[str] = []

            for line in lines:
                line_str = line.strip()
                if not line_str:
                    continue

                unit_num = cls._detect_unit_number(line_str)
                if unit_num is not None:
                    # Flush previous unit buffer if exists
                    if current_unit_no is not None and current_buffer:
                        cls._add_topics_to_unit(units_dict[current_unit_no], current_buffer, source_ref)
                        current_buffer = []

                    current_unit_no = unit_num
                    if current_unit_no not in units_dict:
                        units_dict[current_unit_no] = {
                            "unit_number": current_unit_no,
                            "unit_name": line_str,
                            "topics": []
                        }
                    continue

                if current_unit_no is not None:
                    current_buffer.append(line_str)

            # Flush last buffer on page
            if current_unit_no is not None and current_buffer:
                cls._add_topics_to_unit(units_dict[current_unit_no], current_buffer, source_ref)
                current_buffer = []

        # Convert to Pydantic objects
        syllabus_units = []
        for u_num in sorted(units_dict.keys()):
            raw_u = units_dict[u_num]
            if raw_u["topics"]:
                syllabus_units.append(SyllabusUnit(**raw_u))

        return ExtractedSyllabus(
            subject_name=subject_name,
            subject_code=subject_code,
            units=syllabus_units
        )

    @classmethod
    def _detect_unit_number(cls, text: str) -> Optional[int]:
        match = cls.UNIT_REGEX.match(text)
        if match:
            roman_part, digit_part = match.groups()
            if roman_part:
                return cls.ROMAN_MAP.get(roman_part.lower())
            if digit_part and digit_part.isdigit():
                return int(digit_part)
        return None

    @classmethod
    def _add_topics_to_unit(cls, unit_entry: dict, lines: list[str], source_ref: str) -> None:
        full_text = " ".join(lines)
        # Topics are typically separated by periods or major concepts
        raw_sections = [s.strip() for s in full_text.split(".") if len(s.strip()) > 3]

        unit_no = unit_entry["unit_number"]
        topic_idx = len(unit_entry["topics"]) + 1
        for sec in raw_sections:
            if "reference" in sec.lower() or "objective" in sec.lower() or "bhopal" in sec.lower():
                continue

            parts = [p.strip() for p in sec.split(":") if p.strip()]
            if len(parts) >= 2:
                title = parts[0]
                subtopics = [st.strip() for st in parts[1].split(",") if len(st.strip()) > 1]
            else:
                title = parts[0]
                subtopics = []

            # Deduplication
            existing_titles = [t["title"].lower() for t in unit_entry["topics"]]
            if title.lower() in existing_titles or len(title) < 3:
                continue

            topic_id = f"topic_u{unit_no}_t{topic_idx}"
            unit_entry["topics"].append({
                "id": topic_id,
                "title": title[:100],
                "subtopics": subtopics[:8],
                "source_refs": [source_ref]
            })
            topic_idx += 1
