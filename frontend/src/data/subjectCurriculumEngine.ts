import { Unit, PYQQuestion, Topic } from '../types';
import { curriculumUnits as dbmsUnits, pyqQuestions as dbmsPyqs } from './mockData';

interface TopicSeed {
  title: string;
  weight: number;
  freq: number;
  appearances: number;
  marks5Yr: number;
  difficulty: number;
  difficultyLabel: 'Low' | 'Moderate' | 'High Cognitive Load';
  defEn: string;
  defHi: string;
  analogyTitle: string;
  analogyEn: string;
  analogyHi: string;
  typicalQuestion: string;
  standardMarks: number;
  rubricHighlight: string;
  problemStatement: string;
  steps: Array<{ title: string; content: string; codeSnippet?: string }>;
  mistakes: Array<{ mistake: string; penalty: string; remedy: string }>;
  mcqQuestion: string;
  mcqOptions: string[];
  mcqAnswerIndex: number;
  mcqExplanation: string;
  pyqYear: number;
  pyqSeason: 'May/June' | 'Nov/Dec';
  pyqQNum: string;
}

interface UnitSeed {
  number: number;
  title: string;
  description: string;
  weightMarks: number;
  topics: TopicSeed[];
}

function buildCurriculumFromSeeds(
  subjectCode: string,
  subjectName: string,
  unitSeeds: UnitSeed[]
): { units: Unit[]; pyqs: PYQQuestion[] } {
  const units: Unit[] = [];
  const pyqs: PYQQuestion[] = [];
  let pyqCounter = 1;

  unitSeeds.forEach((uSeed) => {
    const unitId = `unit-${uSeed.number}`;
    const topics: Topic[] = uSeed.topics.map((tSeed, idx) => {
      const topicId = `topic-${uSeed.number}-${idx + 1}`;
      const pyqId1 = `pyq-${subjectCode}-${pyqCounter++}`;
      const pyqId2 = `pyq-${subjectCode}-${pyqCounter++}`;

      pyqs.push({
        id: pyqId1,
        year: tSeed.pyqYear,
        season: tSeed.pyqSeason,
        questionNumber: tSeed.pyqQNum,
        text: tSeed.typicalQuestion,
        marks: tSeed.standardMarks,
        unitId,
        topicId,
        confidence: 95,
        historicalAppearanceCount: tSeed.appearances,
        pageRef: `Doc: ${subjectCode}-PYQ-${tSeed.pyqYear}, Page ${uSeed.number}`,
      });

      pyqs.push({
        id: pyqId2,
        year: tSeed.pyqYear - 1,
        season: tSeed.pyqSeason === 'May/June' ? 'Nov/Dec' : 'May/June',
        questionNumber: `Q.${uSeed.number}(b)`,
        text: `${tSeed.problemStatement} Explain the complete step-by-step derivation and diagram for ${tSeed.title}.`,
        marks: 7,
        unitId,
        topicId,
        confidence: 91,
        historicalAppearanceCount: Math.max(2, tSeed.appearances - 1),
        pageRef: `Doc: ${subjectCode}-PYQ-${tSeed.pyqYear - 1}, Page ${uSeed.number}`,
      });

      return {
        id: topicId,
        unitId,
        title: tSeed.title,
        syllabusWeight: tSeed.weight,
        frequencyScore: tSeed.freq,
        appearancesCount: tSeed.appearances,
        totalMarksInPast5Years: tSeed.marks5Yr,
        difficultyScore: tSeed.difficulty,
        difficultyLabel: tSeed.difficultyLabel,
        masteryPercentage: 0,
        mappedPYQIds: [pyqId1, pyqId2],
        pedagogicalContent: {
          coreDefinition: {
            en: tSeed.defEn,
            hi: tSeed.defHi,
          },
          analogy: {
            title: tSeed.analogyTitle,
            en: tSeed.analogyEn,
            hi: tSeed.analogyHi,
          },
          workedExample: {
            problemStatement: tSeed.problemStatement,
            stepByStepSolution: tSeed.steps.map((s, sIdx) => ({
              step: sIdx + 1,
              title: s.title,
              content: s.content,
              codeSnippet: s.codeSnippet,
            })),
          },
          commonMistakes: tSeed.mistakes,
          examPattern: {
            typicalQuestion: tSeed.typicalQuestion,
            standardMarks: tSeed.standardMarks,
            gradingRubricHighlight: tSeed.rubricHighlight,
          },
          diagnosticCheck: {
            question: tSeed.mcqQuestion,
            options: tSeed.mcqOptions,
            correctAnswerIndex: tSeed.mcqAnswerIndex,
            explanation: tSeed.mcqExplanation,
          },
          citations: [
            {
              id: `cite-${topicId}-1`,
              docName: `RGPV_${subjectCode}_Official_Syllabus.pdf`,
              page: uSeed.number,
              excerpt: `Unit ${uSeed.number}: ${uSeed.title} — ${tSeed.title}. Weightage: ${uSeed.weightMarks} Marks.`,
              context: `${subjectCode} (${subjectName}) Official University Curriculum`,
            },
            {
              id: `cite-${topicId}-2`,
              docName: `RGPV_${subjectCode}_Solved_PYQ_${tSeed.pyqYear}.pdf`,
              page: uSeed.number + 1,
              excerpt: tSeed.typicalQuestion,
              context: `Asked ${tSeed.appearances} times in past 5 years (${tSeed.marks5Yr} total marks)`,
            },
          ],
        },
      };
    });

    units.push({
      id: unitId,
      number: uSeed.number,
      title: uSeed.title,
      code: `${subjectCode} • Unit ${uSeed.number}`,
      description: uSeed.description,
      weightMarks: uSeed.weightMarks,
      topics,
    });
  });

  return { units, pyqs };
}

// ============================================================================
// 1ST SEMESTER SUBJECTS (BT-101 to BT-105)
// ============================================================================

const BT_101_SEEDS: UnitSeed[] = [
  {
    number: 1,
    title: 'Water Analysis, Hardness & Boiler Troubles',
    description: 'Temporary & permanent hardness, EDTA complexometric titration, sludge/scale, priming, foaming, and Zeolite/Lime-Soda softening.',
    weightMarks: 16,
    topics: [
      {
        title: 'EDTA Complexometric Method & CaCO3 Equivalents',
        weight: 95,
        freq: 96,
        appearances: 6,
        marks5Yr: 42,
        difficulty: 65,
        difficultyLabel: 'Moderate',
        defEn: 'Hardness of water is its soap-consuming capacity caused by dissolved bivalent cations (Ca²⁺ and Mg²⁺). In the EDTA method, Ethylene Diamine Tetra Acetic acid forms a stable 1:1 colorless complex with Ca²⁺/Mg²⁺ ions at pH 9–10 (buffered using NH4OH + NH4Cl) using Eriochrome Black-T (EBT) indicator, which changes color from wine-red (unstable Ca/Mg-EBT complex) to steel-blue at the endpoint.',
        defHi: 'Water ki hardness Ca²⁺ aur Mg²⁺ salts ke karan hoti hai. EDTA method mein pH 9–10 (NH4OH + NH4Cl buffer) par Eriochrome Black-T (EBT) indicator use karte hain. Shuru mein EBT metal ions ke sath wine-red unstable complex banata hai, aur titration endpoint par EDTA saare Ca²⁺/Mg²⁺ ions bind kar leta hai jisse solution steel-blue ho jata hai.',
        analogyTitle: 'Magnet Replacement Analogy',
        analogyEn: 'Think of EBT indicator as a weak magnet holding Ca²⁺/Mg²⁺ ions (wine-red). When EDTA (a super-strong magnet) is added from the burette, it snatches the Ca²⁺/Mg²⁺ ions away, leaving free EBT (steel-blue) to signal the exact endpoint.',
        analogyHi: 'EBT ko ek weak magnet samjhiye jo Ca²⁺/Mg²⁺ pakad ke wine-red dikhta hai. Jab burette se strong magnet (EDTA) aata hai, wo ions chheen leta hai aur free EBT steel-blue hokar endpoint bata deta hai.',
        typicalQuestion: 'Explain the principle and procedure of determining total, temporary, and permanent hardness of water by EDTA method. Also calculate hardness in ppm of CaCO3 equivalent.',
        standardMarks: 7,
        rubricHighlight: '2M for Metal-EBT Wine-Red & Metal-EDTA reaction equations + 2M for 3-step procedure (Standard, Total, Permanent) + 3M for CaCO3 equivalent formula & calculation.',
        problemStatement: 'A 50 mL water sample consumed 15 mL of 0.01 M EDTA before boiling and 6 mL of 0.01 M EDTA after boiling. Calculate Total, Permanent, and Temporary hardness in ppm.',
        steps: [
          {
            title: 'Chemical Reaction Equations (Write First in Exam)',
            content: 'Show the indicator reaction and titration endpoint reaction clearly with pH = 10 buffer:',
            codeSnippet: `[Ca²⁺/Mg²⁺] + EBT (Blue) --(pH 9-10)--> [Ca/Mg-EBT] Unstable Complex (Wine-Red)\n[Ca/Mg-EBT] (Wine-Red) + EDTA ---------> [Ca/Mg-EDTA] Stable Colorless + Free EBT (Steel Blue)`,
          },
          {
            title: 'Calculate Total Hardness (Before Boiling)',
            content: 'Since 1 mL of 0.01 M EDTA = 1 mg of CaCO3 equivalent, for V = 50 mL sample consuming 15 mL EDTA:',
            codeSnippet: `Total Hardness = (Volume of EDTA × Molarity × 100 × 1000) / Volume of Sample\nTotal Hardness = (15 × 0.01 × 100 × 1000) / 50 = 300 ppm (mg/L) of CaCO3 eq.`,
          },
          {
            title: 'Calculate Permanent & Temporary Hardness',
            content: 'Boiled water loses bicarbonates (temporary hardness). Using V2 = 6 mL EDTA for 50 mL boiled sample:',
            codeSnippet: `Permanent Hardness = (6 × 0.01 × 100 × 1000) / 50 = 120 ppm\nTemporary Hardness = Total - Permanent = 300 - 120 = 180 ppm`,
          },
        ],
        mistakes: [
          { mistake: 'Forgetting to mention the NH4OH + NH4Cl buffer (pH 9–10)', penalty: '-1.5 Marks', remedy: 'Always write that pH 9–10 is mandatory for EBT indicator to function accurately.' },
          { mistake: 'Swapping Wine-Red and Steel-Blue colors', penalty: '-2 Marks', remedy: 'Initial color with EBT is Wine-Red; Endpoint color with EDTA is Steel-Blue.' },
        ],
        mcqQuestion: 'In EDTA complexometric titration for water hardness, what is the color change at the endpoint using Eriochrome Black-T (EBT) at pH 10?',
        mcqOptions: ['Steel-Blue to Wine-Red', 'Wine-Red to Steel-Blue', 'Colorless to Pink', 'Yellow to Brick-Red'],
        mcqAnswerIndex: 1,
        mcqExplanation: 'Metal-EBT complex is wine-red; at the endpoint EDTA displaces EBT, releasing free EBT which is steel-blue at pH 10.',
        pyqYear: 2024,
        pyqSeason: 'May/June',
        pyqQNum: 'Q.1(a)',
      },
      {
        title: 'Boiler Troubles: Sludge vs Scale & Zeolite Softening Process',
        weight: 88,
        freq: 90,
        appearances: 5,
        marks5Yr: 35,
        difficulty: 55,
        difficultyLabel: 'Moderate',
        defEn: 'Sludge is a soft, loose, slimy precipitate (MgCO3, MgCl2, CaCl2) formed in colder regions of a boiler that can be removed by blow-down. Scale is a hard, adherent, thermally insulating crust (CaSO4, CaSiO3, Mg(OH)2) deposited on inner boiler walls that causes overheating, fuel wastage, and boiler explosion. Zeolite (Permutit, Na2Ze) softens water by exchanging Na⁺ ions for Ca²⁺/Mg²⁺ ions.',
        defHi: 'Boiler mein Sludge ek soft aur loose precipitate (MgCO3, MgCl2) hota hai jise blow-down se hata sakte hain. Scale ek hard crust (CaSO4, CaSiO3) hoti hai jo boiler tube par chipak kar heat transfer rokti hai aur explosion kara sakti hai. Zeolite process mein Sodium Zeolite (Na2Ze) पानी ke Ca²⁺/Mg²⁺ ions ko Na⁺ se exchange kar deta hai.',
        analogyTitle: 'Kettle Limescale vs Muddy Sediment',
        analogyEn: 'Sludge is like loose mud at the bottom of a bucket that washes away easily, whereas Scale is like rock-hard white limescale baked onto an electric kettle coil.',
        analogyHi: 'Sludge balti ke niche baithi dheeli mitti jaisa hai jo paani bahane se nikal jata hai, jabki Scale electric kettle ki coil par jami pathar jaisi safed parat hai.',
        typicalQuestion: 'Differentiate between Sludge and Scale in boilers. Explain the Zeolite (Permutit) process of water softening with neat diagram, softening reactions, and regeneration equations.',
        standardMarks: 7,
        rubricHighlight: '2M for 4-point Sludge vs Scale table + 2.5M for Zeolite column diagram + 2.5M for Softening & NaCl Regeneration equations.',
        problemStatement: 'Write the chemical equations for softening temporary and permanent hardness using Sodium Zeolite (Na2Ze) and show how exhausted Zeolite bed is regenerated.',
        steps: [
          {
            title: 'Ion-Exchange Softening Reactions',
            content: 'When hard water passes through the Na2Ze bed, Ca²⁺ and Mg²⁺ ions are trapped:',
            codeSnippet: `Na2Ze + Ca(HCO3)2 ---> CaZe + 2 NaHCO3 (Temporary Hardness removed)\nNa2Ze + MgSO4     ---> MgZe + Na2SO4   (Permanent Hardness removed)`,
          },
          {
            title: 'Regeneration of Exhausted Zeolite Bed with 10% Brine (NaCl)',
            content: 'Once Na2Ze converts to CaZe/MgZe, flush with 10% NaCl brine solution to restore Na2Ze:',
            codeSnippet: `CaZe + 2 NaCl (10% Brine) ---> Na2Ze (Regenerated) + CaCl2 (Washout)`,
          },
        ],
        mistakes: [
          { mistake: 'Writing CaCl2 as a permanent hardness salt remaining in softened water', penalty: '-1.5 Marks', remedy: 'CaCl2 is formed only during regeneration and is flushed down the drain.' },
        ],
        mcqQuestion: 'Which chemical solution is used to regenerate an exhausted Zeolite (Permutit) bed?',
        mcqOptions: ['10% HCl solution', '10% NaCl (Brine) solution', 'Ca(OH)2 lime water', 'Na2CO3 soda ash'],
        mcqAnswerIndex: 1,
        mcqExplanation: 'Exhausted CaZe/MgZe is regenerated by passing 10% NaCl brine solution, restoring Na2Ze.',
        pyqYear: 2023,
        pyqSeason: 'Nov/Dec',
        pyqQNum: 'Q.2(a)',
      },
    ],
  },
  {
    number: 2,
    title: 'Fuels, Combustion & Calorific Value Analysis',
    description: 'HCV vs LCV, Dulong formula, Bomb Calorimeter, Proximate & Ultimate analysis of coal, and Octane/Cetane numbers.',
    weightMarks: 15,
    topics: [
      {
        title: 'Bomb Calorimeter, HCV/LCV & Dulong’s Formula Numericals',
        weight: 94,
        freq: 95,
        appearances: 6,
        marks5Yr: 42,
        difficulty: 70,
        difficultyLabel: 'Moderate',
        defEn: 'Higher Calorific Value (HCV/GCV) is the total heat liberated when 1 unit mass of fuel is completely burnt and the products of combustion are cooled to room temperature (15°C). Lower Calorific Value (LCV/NCV) excludes the latent heat of condensation of steam (587 cal/g). Bomb Calorimeter measures HCV of solid and non-volatile liquid fuels burned at constant volume under 25 atm O2.',
        defHi: 'Higher Calorific Value (HCV) wo total heat hai jo 1 unit fuel ko pura jalane aur combustion products ko room temperature tak thanda karne par milti hai. Lower Calorific Value (LCV) mein steam ki latent heat (587 cal/g) subtract kar di jati hai. Bomb Calorimeter solid aur liquid fuels ka HCV nikalne ke kaam aata hai.',
        analogyTitle: 'Gross Salary vs Take-Home Salary',
        analogyEn: 'HCV is like your Gross Salary (total heat produced including steam heat), while LCV is your Take-Home Net Salary after deducting steam heat that escapes up the chimney.',
        analogyHi: 'HCV aapki Gross Salary jaisa hai, aur LCV Take-Home Net Salary jaisa hai jisme chimney se bhaap (steam) bankar udi heat minus ho jati hai.',
        typicalQuestion: 'Draw a neat labeled diagram of Bomb Calorimeter. Derive the formula for HCV with Beckmann thermometer, fuse wire, acid, and cooling corrections. Also state Dulong’s formula.',
        standardMarks: 10,
        rubricHighlight: '3M for labeled Bomb Calorimeter diagram + 3M for Heat Balance Equation + 2M for Correction Formula + 2M for Dulong HCV/LCV.',
        problemStatement: 'A coal sample contains C = 80%, H = 6%, O = 4%, S = 2%, and Ash = 8%. Calculate HCV and LCV using Dulong’s formula.',
        steps: [
          {
            title: 'Write Dulong’s Formula for HCV',
            content: 'Substitute the percentage of Carbon, Hydrogen, Oxygen, and Sulphur:',
            codeSnippet: `HCV = (1/100) × [ 8080 C + 34500 (H - O/8) + 2240 S ] kcal/kg\nHCV = (1/100) × [ 8080(80) + 34500(6 - 4/8) + 2240(2) ]\nHCV = (1/100) × [ 646400 + 189750 + 4480 ] = 8406.3 kcal/kg`,
          },
          {
            title: 'Calculate LCV from HCV',
            content: 'Since 1 part H forms 9 parts H2O and latent heat of steam = 587 kcal/kg:',
            codeSnippet: `LCV = HCV - (0.09 × H × 587) kcal/kg\nLCV = 8406.3 - (0.09 × 6 × 587) = 8406.3 - 316.98 = 8089.32 kcal/kg`,
          },
        ],
        mistakes: [
          { mistake: 'Adding fuse wire and acid corrections instead of subtracting them in Bomb Calorimeter', penalty: '-2 Marks', remedy: 'Cooling correction (t_c) is ADDED to ΔT, whereas Acid (c_a) and Fuse wire (c_f) corrections are SUBTRACTED from total heat.' },
        ],
        mcqQuestion: 'In Bomb Calorimeter calculations, how are cooling correction (tc) and acid/fuse wire corrections (ca + cf) applied?',
        mcqOptions: [
          'Both tc and (ca + cf) are added',
          'tc is added to temperature rise, while (ca + cf) are subtracted from total heat',
          'tc is subtracted, while (ca + cf) are added',
          'Both are multiplied by water equivalent W',
        ],
        mcqAnswerIndex: 1,
        mcqExplanation: 'Cooling correction compensates for heat lost by radiation (added to ΔT), while fuse wire and acid formation add extraneous heat (subtracted from total heat).',
        pyqYear: 2024,
        pyqSeason: 'May/June',
        pyqQNum: 'Q.3(a)',
      },
    ],
  },
  {
    number: 3,
    title: 'Lubricants & Corrosion Engineering',
    description: 'Hydrodynamic, boundary & extreme-pressure lubrication, Flash/Fire/Cloud/Pour points, Viscosity Index, and Electrochemical theory of corrosion.',
    weightMarks: 14,
    topics: [
      {
        title: 'Mechanism of Lubrication (Fluid-Film, Boundary & Extreme Pressure)',
        weight: 86,
        freq: 89,
        appearances: 5,
        marks5Yr: 35,
        difficulty: 50,
        difficultyLabel: 'Low',
        defEn: 'Lubrication reduces frictional resistance and wear between two moving metallic surfaces by interposing a lubricant film. (1) Fluid-Film / Hydrodynamic Lubrication uses a thick liquid film (>1000 Å) for high speed & low load; (2) Boundary / Thin-Film Lubrication uses adsorbed polar molecules (2–3 layers) for high load & low speed; (3) Extreme Pressure Lubrication uses chlorinated/sulphurized/phosphorized additives that react at high temperature to form durable metallic chloride/sulphide films.',
        defHi: 'Lubrication do moving metal surfaces ke beech friction aur wear kam karta hai. (1) Hydrodynamic Lubrication: High speed aur low load ke liye thick oil film (>1000 Å); (2) Boundary Lubrication: High load aur low speed ke liye polar molecules ki patli adsorbed layer; (3) Extreme Pressure Lubrication: Heavy load aur high temperature par Cl, S, P additives metal ke sath react karke protective metallic film banate hain.',
        analogyTitle: 'Hydroplaning vs Non-Stick Pan Coating',
        analogyEn: 'Hydrodynamic lubrication is like a surfboard floating on a thick layer of water, while Boundary lubrication is like a thin molecular Teflon coating bonded to a pan.',
        analogyHi: 'Hydrodynamic lubrication paani ki moti parat par tairne jaisa hai, aur Boundary lubrication tave par lagi patli non-stick coating jaisa hai.',
        typicalQuestion: 'Explain Hydrodynamic (Fluid-Film), Boundary, and Extreme Pressure lubrication mechanisms with neat surface diagrams and operating conditions.',
        standardMarks: 7,
        rubricHighlight: '3M for 3 surface contact diagrams + 3M for speed/load/viscosity conditions + 1M for examples (graphite, MoS2, EP additives).',
        problemStatement: 'Compare Fluid-Film, Boundary, and Extreme Pressure lubrication across film thickness, load, speed, coefficient of friction, and lubricant examples.',
        steps: [
          {
            title: 'Draw & Compare Operating Regimes',
            content: 'Present a structured 3-column comparison in your exam sheet:',
            codeSnippet: `1. Fluid-Film: Thickness > 1000 Å | High Speed, Light Load | μ = 0.001 to 0.03 | Mineral Oils\n2. Boundary:   Thickness 20-30 Å  | Low Speed, High Load  | μ = 0.05 to 0.15  | Vegetable Oils, MoS2, Graphite\n3. Extreme P.: High Temp & Load   | Chemical Reaction Film| Prevents Welding  | Chlorinated Esters, Tricresyl Phosphate`,
          },
        ],
        mistakes: [
          { mistake: 'Confusing Flash Point with Fire Point', penalty: '-1.5 Marks', remedy: 'Flash point gives a momentary flash (<5 sec); Fire point sustains continuous burning for at least 5 seconds (usually 5°–40°C higher than flash point).' },
        ],
        mcqQuestion: 'Which lubrication mechanism is suitable for journals operating at high load and very low speed where a continuous thick oil film cannot be maintained?',
        mcqOptions: ['Hydrodynamic lubrication', 'Boundary (Thin-film) lubrication', 'Aerodynamic lubrication', 'Zero-viscosity lubrication'],
        mcqAnswerIndex: 1,
        mcqExplanation: 'Under high load and low speed, thick oil films squeeze out, so Boundary lubrication relies on adsorbed polar oil molecules or solid lubricants (Graphite/MoS2).',
        pyqYear: 2023,
        pyqSeason: 'May/June',
        pyqQNum: 'Q.4(a)',
      },
    ],
  },
  {
    number: 4,
    title: 'High Polymers, Elastomers & Biodegradable Polymers',
    description: 'Free-radical & ionic polymerization, PVC, Teflon, Nylon-6,6, Bakelite, Vulcanization of natural rubber, and Buna-S / Neoprene.',
    weightMarks: 13,
    topics: [
      {
        title: 'Nylon-6,6, Bakelite Synthesis & Vulcanization of Rubber',
        weight: 85,
        freq: 88,
        appearances: 5,
        marks5Yr: 35,
        difficulty: 60,
        difficultyLabel: 'Moderate',
        defEn: 'Nylon-6,6 is a condensation polyamide formed by step-growth polymerization of Hexamethylene diamine and Adipic acid with elimination of H2O. Bakelite (Phenol-Formaldehyde resin) is a thermosetting cross-linked polymer synthesized via Novolac intermediate. Vulcanization heats natural cis-1,4-polyisoprene rubber with 3–5% Sulphur at 110–140°C to form sulphur cross-links at allylic double bonds, increasing tensile strength and elasticity.',
        defHi: 'Nylon-6,6 ek condensation polyamide hai jo Hexamethylene diamine aur Adipic acid ke reaction se banta hai. Bakelite Phenol aur Formaldehyde se banne wala thermosetting polymer hai. Vulcanization mein natural rubber ko 3–5% Sulphur ke sath 110–140°C par heat karte hain jisse chains ke beech Sulphur cross-links bante hain aur rubber strong aur elastic ho jata hai.',
        analogyTitle: 'Rungs on a Rope Ladder (Vulcanization)',
        analogyEn: 'Raw rubber chains slide past each other like loose spaghetti strands. Vulcanization adds Sulphur bridges like rungs on a ladder, so when stretched, the chains snap right back into shape.',
        analogyHi: 'Raw rubber ki chains uble hue noodles ki tarah fisalti hain. Vulcanization unke beech Sulphur ke bridges (seedhi ke dande) jod deta hai jisse khinchne par rubber wapas apni shape mein aa jata hai.',
        typicalQuestion: 'Write the monomer structures, polymerization reactions, properties, and engineering applications of: (i) Nylon-6,6, (ii) Bakelite, and (iii) Vulcanized Rubber.',
        standardMarks: 7,
        rubricHighlight: '3M for balanced monomer-to-polymer chemical structures + 2M for cross-linking diagram + 2M for properties & applications.',
        problemStatement: 'Show the exact chemical reaction equations for synthesizing Nylon-6,6 and vulcanizing cis-1,4-polyisoprene with Sulphur.',
        steps: [
          {
            title: 'Nylon-6,6 Condensation Polymerization Reaction',
            content: 'Combine n moles of Hexamethylene diamine (6 carbons) + n moles of Adipic acid (6 carbons):',
            codeSnippet: `n H2N-(CH2)6-NH2 + n HOOC-(CH2)4-COOH --(Heat, -2n H2O)--> [-HN-(CH2)6-NH-CO-(CH2)4-CO-]n (Nylon-6,6)`,
          },
          {
            title: 'Vulcanization Cross-Linking with Sulphur',
            content: 'Sulphur bridges (-S-S-) link adjacent polyisoprene chains at double bonds:',
            codeSnippet: `...-CH2-C(CH3)=CH-CH2-... + Sulphur (140°C) ---> Cross-linked Elastomer with -S-S- bridges`,
          },
        ],
        mistakes: [
          { mistake: 'Forgetting to eliminate H2O molecules in condensation polymerization of Nylon-6,6', penalty: '-1.5 Marks', remedy: 'Always write -(2n-1) H2O on the reaction arrow for condensation polymers.' },
        ],
        mcqQuestion: 'Natural rubber is vulcanized by heating it with 3–5% Sulphur to:',
        mcqOptions: [
          'Increase water absorption capacity',
          'Introduce sulphur cross-links between polyisoprene chains to improve tensile strength and elasticity',
          'Break polymer chains into liquid monomers',
          'Convert it into a conducting metal',
        ],
        mcqAnswerIndex: 1,
        mcqExplanation: 'Sulphur forms cross-links between polyisoprene chains, preventing permanent plastic deformation and restoring elasticity.',
        pyqYear: 2024,
        pyqSeason: 'May/June',
        pyqQNum: 'Q.5(b)',
      },
    ],
  },
  {
    number: 5,
    title: 'Phase Rule, Green Chemistry & Spectroscopic Techniques',
    description: 'Gibbs Phase Rule (F = C - P + 2), Water & Ag-Pb phase diagrams, UV-Visible & IR Spectroscopy (Beer-Lambert Law).',
    weightMarks: 12,
    topics: [
      {
        title: 'Gibbs Phase Rule (F = C - P + 2) & One-Component Water System',
        weight: 82,
        freq: 85,
        appearances: 4,
        marks5Yr: 28,
        difficulty: 65,
        difficultyLabel: 'Moderate',
        defEn: 'Gibbs Phase Rule states that for a heterogeneous system in equilibrium not influenced by electrical, magnetic, or gravitational forces, the Degrees of Freedom (F) is given by F = C - P + 2, where C is the number of components and P is the number of phases. In the Water System (C = 1), at the Triple Point (0.0075°C, 4.58 mm Hg), Ice, Liquid Water, and Vapour coexist (P = 3), giving F = 1 - 3 + 2 = 0 (non-variant).',
        defHi: 'Gibbs Phase Rule ke anusar equilibrium mein kisi heterogeneous system ki Degree of Freedom F = C - P + 2 hoti hai, jahan C components aur P phases hain. Water system (C = 1) ke Triple Point (0.0075°C, 4.58 mm Hg) par Ice, Water aur Vapour teeno phases (P = 3) ek sath rehte hain, isliye F = 1 - 3 + 2 = 0 (invariant point) hota hai.',
        analogyTitle: 'GPS Coordinates on a Map',
        analogyEn: 'Inside a region (Ice, Water, or Steam), you need both Temperature and Pressure (F=2) to locate your state. On a boundary line, choosing Temperature automatically fixes Pressure (F=1). At the Triple Point intersection, both are locked (F=0).',
        analogyHi: 'Area ke andar state batane ke liye Temperature aur Pressure dono chahiye (F=2). Curve line par ek fix karne se dusra khud fix ho jata hai (F=1). Triple Point par dono pehle se locked hain (F=0).',
        typicalQuestion: 'State Gibbs Phase Rule and define Phase (P), Component (C), and Degree of Freedom (F). Draw and explain the Phase Diagram of the One-Component Water System.',
        standardMarks: 7,
        rubricHighlight: '2M for Phase Rule definitions + 3M for P-T phase diagram of Water showing OA, OB, OC curves & Triple Point + 2M for degree of freedom calculation.',
        problemStatement: 'Calculate the degree of freedom (F) for the Water system (C=1) inside an area (P=1), along the vaporization curve OA (P=2), and at the Triple Point O (P=3).',
        steps: [
          {
            title: 'Apply F = C - P + 2 for C = 1 (H2O)',
            content: 'Evaluate F for Areas, Curves, and the Triple Point:',
            codeSnippet: `1. Area (Ice / Water / Vapour alone): P = 1 => F = 1 - 1 + 2 = 2 (Bivariant)\n2. Curve OA, OB, OC (2 phases in eq.): P = 2 => F = 1 - 2 + 2 = 1 (Univariant)\n3. Triple Point O (Ice ⇌ Water ⇌ Steam): P = 3 => F = 1 - 3 + 2 = 0 (Non-variant at 0.0075°C, 4.58 mmHg)`,
          },
        ],
        mistakes: [
          { mistake: 'Drawing the melting curve OB (Ice-Water) with a positive slope', penalty: '-2 Marks', remedy: 'Ice is less dense than liquid water, so the fusion curve OB of water slopes BACKWARD (negative slope) as pressure increases.' },
        ],
        mcqQuestion: 'What is the degree of freedom (F) at the Triple Point of the one-component Water system (0.0075°C and 4.58 mm Hg)?',
        mcqOptions: ['F = 2 (Bivariant)', 'F = 1 (Univariant)', 'F = 0 (Non-variant / Invariant)', 'F = 3 (Trivariant)'],
        mcqAnswerIndex: 2,
        mcqExplanation: 'At the triple point, C = 1 and P = 3 (Ice, Water, Vapour), so F = C - P + 2 = 1 - 3 + 2 = 0.',
        pyqYear: 2023,
        pyqSeason: 'Nov/Dec',
        pyqQNum: 'Q.6(a)',
      },
    ],
  },
];

const BT_102_SEEDS: UnitSeed[] = [
  {
    number: 1,
    title: 'Differential Calculus: Mean Value Theorems & Maxima-Minima',
    description: 'Rolle’s Theorem, Lagrange’s & Cauchy’s Mean Value Theorems, Taylor’s & Maclaurin’s series, Partial derivatives, Euler’s Theorem, and Lagrange Multipliers.',
    weightMarks: 16,
    topics: [
      {
        title: 'Rolle’s Theorem, Lagrange’s Mean Value Theorem & Maclaurin Series',
        weight: 94,
        freq: 95,
        appearances: 6,
        marks5Yr: 42,
        difficulty: 65,
        difficultyLabel: 'Moderate',
        defEn: 'Rolle’s Theorem states that if f(x) is continuous on [a, b], differentiable on (a, b), and f(a) = f(b), then there exists at least one c ∈ (a, b) such that f\'(c) = 0. Lagrange’s Mean Value Theorem generalizes this when f(a) ≠ f(b): there exists c ∈ (a, b) such that f\'(c) = [f(b) - f(a)] / (b - a), meaning the tangent at c is parallel to the secant chord AB.',
        defHi: 'Rolle’s Theorem kehta hai ki agar f(x) closed interval [a, b] mein continuous hai, open interval (a, b) mein differentiable hai, aur f(a) = f(b), toh kam se kam ek point c ∈ (a, b) aisa hoga jahan tangent horizontal hogi yaani f\'(c) = 0. Lagrange’s MVT mein f\'(c) = [f(b) - f(a)] / (b - a) hota hai.',
        analogyTitle: 'Throwing a Ball Up and Catching It at the Same Height',
        analogyEn: 'If you throw a ball from height h at t=a and catch it at the same height h at t=b, at its peak moment t=c its vertical velocity f\'(c) must momentarily be zero.',
        analogyHi: 'Agar aap gend ko h height se uchhalte hain aur wapas usi h height par pakadte hain, toh top point c par uski vertical speed f\'(c) = 0 zaroor hogi.',
        typicalQuestion: 'Verify Rolle’s Theorem for f(x) = x(x + 3)e^(-x/2) in [-3, 0]. Also explain the geometrical interpretation of Rolle’s and Lagrange’s Mean Value Theorems with graphs.',
        standardMarks: 7,
        rubricHighlight: '2M for 3 continuity/differentiability/boundary conditions + 2M for geometric tangent graph + 3M for solving f\'(c) = 0 inside (-3, 0).',
        problemStatement: 'Verify Rolle’s theorem for f(x) = x(x + 3)e^(-x/2) on the interval [-3, 0] and find the exact value of c.',
        steps: [
          {
            title: 'Check the 3 Rolle’s Conditions on [-3, 0]',
            content: 'Since polynomials and e^(-x/2) are continuous and differentiable everywhere:',
            codeSnippet: `1. f(x) = (x² + 3x)e^(-x/2) is continuous on [-3, 0].\n2. f(x) is differentiable on (-3, 0).\n3. f(-3) = 0 and f(0) = 0  ==>  f(-3) = f(0) = 0. All 3 conditions satisfied!`,
          },
          {
            title: 'Differentiate and Solve f\'(c) = 0',
            content: 'Apply product rule to find f\'(x) and equate to 0:',
            codeSnippet: `f'(x) = (2x + 3)e^(-x/2) - (1/2)(x² + 3x)e^(-x/2) = e^(-x/2) [ -x² + x + 6 ] / 2\nSet f'(c) = 0 => c² - c - 6 = 0 => (c - 3)(c + 2) = 0\nSince c = -2 ∈ (-3, 0), Rolle's Theorem is verified!`,
          },
        ],
        mistakes: [
          { mistake: 'Accepting both roots c = 3 and c = -2 without checking if c lies inside the open interval (-3, 0)', penalty: '-2 Marks', remedy: 'Explicitly reject c = 3 because 3 ∉ (-3, 0) and highlight c = -2 ∈ (-3, 0).' },
        ],
        mcqQuestion: 'Which condition is NOT required for Lagrange’s Mean Value Theorem on [a, b]?',
        mcqOptions: [
          'f(x) is continuous on closed interval [a, b]',
          'f(x) is differentiable on open interval (a, b)',
          'f(a) = f(b)',
          'a and b are finite real numbers',
        ],
        mcqAnswerIndex: 2,
        mcqExplanation: 'f(a) = f(b) is required only for Rolle’s Theorem, not for Lagrange’s Mean Value Theorem.',
        pyqYear: 2024,
        pyqSeason: 'May/June',
        pyqQNum: 'Q.1(b)',
      },
      {
        title: 'Euler’s Theorem on Homogeneous Functions & Lagrange Multipliers',
        weight: 90,
        freq: 92,
        appearances: 5,
        marks5Yr: 35,
        difficulty: 72,
        difficultyLabel: 'High Cognitive Load',
        defEn: 'If u(x, y) is a homogeneous function of degree n in x and y such that u(tx, ty) = t^n u(x, y), Euler’s Theorem states that x(∂u/∂x) + y(∂u/∂y) = n·u, and for second order: x²(∂²u/∂x²) + 2xy(∂²u/∂x∂y) + y²(∂²u/∂y²) = n(n - 1)u. Lagrange’s Method of Undetermined Multipliers finds extrema of f(x,y,z) subject to φ(x,y,z) = 0 using F = f + λφ.',
        defHi: 'Agar u(x, y) degree n ka homogeneous function hai, toh Euler’s Theorem ke anusar x(∂u/∂x) + y(∂u/∂y) = n·u hota hai. Lagrange Multipliers method mein constraint φ(x,y,z) = 0 ke sath maxima/minima nikalne ke liye auxiliary function F = f + λφ banate hain.',
        analogyTitle: 'Scaling a 3D Blueprint Uniformly',
        analogyEn: 'Doubling all dimensions of a cube scales its volume by 2³ (degree n=3). Euler’s theorem links the partial rates of change along x and y directly to that scaling power n.',
        analogyHi: 'Jaise kisi cube ki sides double karne par volume 2³ guna badhta hai (degree n=3), Euler’s theorem x aur y ke partial derivatives ko seedha degree n se jodta hai.',
        typicalQuestion: 'If u = sin⁻¹((x² + y²) / (x + y)), prove using Euler’s Theorem that x(∂u/∂x) + y(∂u/∂y) = tan u.',
        standardMarks: 7,
        rubricHighlight: '2M for rewriting z = sin u as homogeneous function of degree n=1 + 3M for applying Euler’s Theorem on z + 2M for simplifying sin u / cos u = tan u.',
        problemStatement: 'Given u = sin⁻¹((x² + y²) / (x + y)), prove that x(∂u/∂x) + y(∂u/∂y) = tan u.',
        steps: [
          {
            title: 'Convert Inverse Trig to Homogeneous Function z = sin u',
            content: 'u itself is not homogeneous, so take sin on both sides:',
            codeSnippet: `Let z = sin u = (x² + y²) / (x + y) = x²[1 + (y/x)²] / x[1 + (y/x)] = x · f(y/x)\nClearly, z is a homogeneous function of x and y of degree n = 2 - 1 = 1.`,
          },
          {
            title: 'Apply Euler’s Theorem to z = sin u',
            content: 'Substitute ∂z/∂x = cos u (∂u/∂x) and ∂z/∂y = cos u (∂u/∂y):',
            codeSnippet: `By Euler's Theorem: x(∂z/∂x) + y(∂z/∂y) = 1 · z\nx cos u (∂u/∂x) + y cos u (∂u/∂y) = sin u\nx(∂u/∂x) + y(∂u/∂y) = sin u / cos u = tan u.  (Hence Proved)`,
          },
        ],
        mistakes: [
          { mistake: 'Applying Euler’s theorem directly to u = sin⁻¹(...) instead of z = sin u', penalty: '-3 Marks', remedy: 'Inverse trigonometric or logarithmic functions must first be rewritten as z = sin u or z = e^u so z is purely algebraic and homogeneous.' },
        ],
        mcqQuestion: 'If z = sin u = (x³ + y³)/(x + y), what is the degree of homogeneity n of z?',
        mcqOptions: ['n = 3', 'n = 2', 'n = 1', 'n = 0'],
        mcqAnswerIndex: 1,
        mcqExplanation: 'Numerator has degree 3 and denominator has degree 1, so z has degree n = 3 - 1 = 2.',
        pyqYear: 2024,
        pyqSeason: 'May/June',
        pyqQNum: 'Q.2(a)',
      },
    ],
  },
  {
    number: 2,
    title: 'Integral Calculus: Beta & Gamma Functions',
    description: 'Definite integrals as limit of sum, Beta and Gamma functions, Duplication formula, and differentiation under integral sign.',
    weightMarks: 14,
    topics: [
      {
        title: 'Beta & Gamma Functions, Relation B(m,n) = Γ(m)Γ(n)/Γ(m+n)',
        weight: 92,
        freq: 93,
        appearances: 5,
        marks5Yr: 35,
        difficulty: 68,
        difficultyLabel: 'Moderate',
        defEn: 'Euler’s First Integral (Beta Function) is B(m, n) = ∫₀¹ x^(m-1) (1 - x)^(n-1) dx (m, n > 0), which is symmetric: B(m, n) = B(n, m). Euler’s Second Integral (Gamma Function) is Γ(n) = ∫₀^∞ e^(-x) x^(n-1) dx (n > 0), satisfying Γ(n+1) = nΓ(n) and Γ(1/2) = √π. They are linked by B(m, n) = [Γ(m) · Γ(n)] / Γ(m + n).',
        defHi: 'Beta Function B(m, n) = ∫₀¹ x^(m-1)(1-x)^(n-1) dx aur Gamma Function Γ(n) = ∫₀^∞ e^(-x) x^(n-1) dx hai. Inka relation B(m, n) = [Γ(m)Γ(n)] / Γ(m + n) aur Γ(1/2) = √π trigonometric integrals ko bina lambi integration ke solve karne ke kaam aata hai.',
        analogyTitle: 'Factorial Extension to Fractions',
        analogyEn: 'Standard factorials (n!) only work for whole numbers. The Gamma function Γ(n+1) connects the dots smoothly so you can compute factorials of fractions like (1/2)! = √π / 2.',
        analogyHi: 'Factorial (n!) sirf whole numbers ke liye hota hai, jabki Gamma function Γ(n+1) fractions ka bhi factorial nikal deta hai, jaise Γ(1/2) = √π.',
        typicalQuestion: 'State and prove the relation between Beta and Gamma functions: B(m, n) = Γ(m)Γ(n) / Γ(m + n). Hence evaluate ∫₀^(π/2) sin^p(θ) cos^q(θ) dθ.',
        standardMarks: 7,
        rubricHighlight: '2M for definitions of B(m,n) and Γ(n) + 3M for polar/transformation proof + 2M for trigonometric reduction formula.',
        problemStatement: 'Evaluate I = ∫₀^(π/2) sin⁵θ cos⁴θ dθ using the Beta-Gamma trigonometric formula.',
        steps: [
          {
            title: 'Write the Beta-Gamma Trigonometric Formula',
            content: 'For ∫₀^(π/2) sin^p(θ) cos^q(θ) dθ, use Gamma values directly:',
            codeSnippet: `∫₀^(π/2) sin^p(θ) cos^q(θ) dθ = [ Γ((p+1)/2) · Γ((q+1)/2) ] / [ 2 · Γ((p+q+2)/2) ]`,
          },
          {
            title: 'Substitute p = 5 and q = 4',
            content: 'Use Γ(n+1) = nΓ(n) and Γ(1/2) = √π:',
            codeSnippet: `I = [ Γ(3) · Γ(5/2) ] / [ 2 · Γ(11/2) ]\nΓ(3) = 2! = 2;  Γ(5/2) = (3/2)(1/2)√π;  Γ(11/2) = (9/2)(7/2)(5/2)(3/2)(1/2)√π\nI = 2 / [ 2 × (9/2 × 7/2 × 5/2) ] = 8 / 315`,
          },
        ],
        mistakes: [
          { mistake: 'Forgetting the factor of 2 in the denominator of [Γ((p+1)/2)Γ((q+1)/2)] / [2 Γ((p+q+2)/2)]', penalty: '-2 Marks', remedy: 'Always double-check the 2 in the denominator of the sin^p cos^q formula.' },
        ],
        mcqQuestion: 'What is the exact value of Γ(1/2)?',
        mcqOptions: ['π', '√π', 'π / 2', '1 / √π'],
        mcqAnswerIndex: 1,
        mcqExplanation: 'Using B(1/2, 1/2) = [Γ(1/2)]² / Γ(1) = π, we get Γ(1/2) = √π.',
        pyqYear: 2023,
        pyqSeason: 'May/June',
        pyqQNum: 'Q.3(a)',
      },
    ],
  },
  {
    number: 3,
    title: 'Multiple Integrals: Change of Order & Jacobian',
    description: 'Double and Triple integrals, Change of order of integration, Change of variables using Jacobians (Cartesian to Polar/Spherical).',
    weightMarks: 14,
    topics: [
      {
        title: 'Change of Order of Integration in Double Integrals',
        weight: 89,
        freq: 91,
        appearances: 5,
        marks5Yr: 35,
        difficulty: 78,
        difficultyLabel: 'High Cognitive Load',
        defEn: 'Changing the order of integration converts ∫∫ f(x, y) dy dx (vertical strip first) into ∫∫ f(x, y) dx dy (horizontal strip first) over the same region R. This is essential when the inner integral (such as ∫ e^(y²) dy or ∫ (sin y)/y dy) has no elementary antiderivative.',
        defHi: 'Double integral mein Change of Order ka matlab hai vertical strip (dy dx) ko horizontal strip (dx dy) mein badalna. Jab andar wala integral (jaise ∫ e^(y²) dy) seedha integrate nahi ho sakta, tab strip badalne se integral aasani se solve ho jata hai.',
        analogyTitle: 'Mowing a Lawn North-South vs East-West',
        analogyEn: 'Whether you mow a lawn in vertical strips (North-South) or horizontal strips (East-West), the total grass area covered is identical—only the start and end boundaries of each strip change.',
        analogyHi: 'Khet ko vertical पट्टी (dy dx) mein kaatein ya horizontal पट्टी (dx dy) mein, total area barabar rehta hai—bas limits curve ke hisab se badal jati hain.',
        typicalQuestion: 'Change the order of integration in I = ∫₀^a ∫_y^a [x / (x² + y²)] dx dy and hence evaluate the integral.',
        standardMarks: 7,
        rubricHighlight: '2.5M for sketching the region of integration (vertical vs horizontal strip) + 2M for new limits + 2.5M for final evaluation.',
        problemStatement: 'Change the order of integration and evaluate I = ∫₀^a ∫_y^a [x / (x² + y²)] dx dy.',
        steps: [
          {
            title: 'Identify Existing Region & Draw Strip',
            content: 'Given limits: x varies from x = y to x = a (horizontal strip), and y varies from y = 0 to y = a. This is the lower triangle bounded by y = 0, x = a, and the line y = x.',
            codeSnippet: `Original (Horizontal strip): y = 0 to a,  x = y to a\nNew (Vertical strip):        x = 0 to a,  y = 0 to x`,
          },
          {
            title: 'Evaluate Inner Integral with Respect to y First',
            content: 'Integrate with respect to y from 0 to x using ∫ dy/(x² + y²) = (1/x) tan⁻¹(y/x):',
            codeSnippet: `I = ∫₀^a x [ (1/x) tan⁻¹(y/x) ]₀^x dx\nI = ∫₀^a [ tan⁻¹(1) - tan⁻¹(0) ] dx = (π/4) ∫₀^a 1 dx = πa / 4`,
          },
        ],
        mistakes: [
          { mistake: 'Swapping the integral signs without drawing the region R and recalculating limits', penalty: '-4 Marks', remedy: 'Never just swap the integral limits directly when limits contain variables; always sketch the bounding curves (e.g., y = x) and rotate the strip.' },
        ],
        mcqQuestion: 'When changing double integral ∫∫ f(x,y) dx dy from Cartesian (x, y) to Polar coordinates (r, θ), the differential area element dx dy is replaced by:',
        mcqOptions: ['dr dθ', 'r dr dθ', 'r² dr dθ', '(1/r) dr dθ'],
        mcqAnswerIndex: 1,
        mcqExplanation: 'The Jacobian J = ∂(x,y)/∂(r,θ) = r, so dx dy = r dr dθ.',
        pyqYear: 2024,
        pyqSeason: 'May/June',
        pyqQNum: 'Q.4(a)',
      },
    ],
  },
  {
    number: 4,
    title: 'Linear Algebra: Matrices, Rank & System of Linear Equations',
    description: 'Rank of matrix by Echelon & Normal form, Consistency of non-homogeneous linear equations (Rouche’s Theorem), and Gauss-Jordan method.',
    weightMarks: 13,
    topics: [
      {
        title: 'Rank of Matrix & Consistency of Linear Equations (Rouche’s Theorem)',
        weight: 91,
        freq: 94,
        appearances: 6,
        marks5Yr: 42,
        difficulty: 60,
        difficultyLabel: 'Moderate',
        defEn: 'For a linear system AX = B in n unknowns with augmented matrix [A | B]: (1) If Rank(A) ≠ Rank([A | B]), the system is Inconsistent (No Solution); (2) If Rank(A) = Rank([A | B]) = r = n, the system is Consistent with a Unique Solution; (3) If Rank(A) = Rank([A | B]) = r < n, the system is Consistent with Infinitely Many Solutions containing (n - r) free parameters.',
        defHi: 'Linear equations AX = B ke liye: (1) Agar Rank(A) ≠ Rank([A|B]) hai toh No Solution (Inconsistent); (2) Agar Rank(A) = Rank([A|B]) = n (variables) hai toh Unique Solution; (3) Agar Rank(A) = Rank([A|B]) = r < n hai toh Infinite Solutions milte hain jisme (n - r) arbitrary constants hote hain.',
        analogyTitle: 'Three Clues for Three Unknowns',
        analogyEn: 'If 3 witnesses give 3 independent, non-contradictory clues for 3 suspects (Rank=3=n), you find the exact culprit. If one clue contradicts another (Rank A ≠ Rank A|B), there is no solution.',
        analogyHi: '3 variables ke liye 3 independent clues hon toh Unique answer milta hai; agar koi clue contradict kare toh No Solution, aur agar ek clue duplicate ho toh Infinite solutions bante hain.',
        typicalQuestion: 'Investigate for what values of λ and μ the simultaneous equations x + y + z = 6, x + 2y + 3z = 10, x + 2y + λz = μ have: (i) No solution, (ii) A unique solution, (iii) An infinite number of solutions.',
        standardMarks: 7,
        rubricHighlight: '3M for row-echelon reduction of augmented matrix [A|B] + 3M for exact λ and μ conditions + 1M for rank justification.',
        problemStatement: 'Find the values of λ and μ for x + y + z = 6, x + 2y + 3z = 10, x + 2y + λz = μ to have no solution, unique solution, or infinite solutions.',
        steps: [
          {
            title: 'Form Augmented Matrix [A | B] and Apply Row Operations',
            content: 'Apply R2 -> R2 - R1 and R3 -> R3 - R1, then R3 -> R3 - R2:',
            codeSnippet: `[ 1  1   1   |  6   ]\n[ 0  1   2   |  4   ]\n[ 0  0  λ-3  | μ-10 ]`,
          },
          {
            title: 'State the Three Rank Cases from the Last Row [ 0  0  λ-3 | μ-10 ]',
            content: 'Compare Rank(A) and Rank([A|B]) against n = 3 unknowns:',
            codeSnippet: `(i)   Unique Solution:    λ ≠ 3 (for any μ)    => Rank(A) = Rank(A|B) = 3 = n\n(ii)  No Solution:        λ = 3 and μ ≠ 10     => Rank(A) = 2 ≠ Rank(A|B) = 3\n(iii) Infinite Solutions: λ = 3 and μ = 10     => Rank(A) = Rank(A|B) = 2 < 3`,
          },
        ],
        mistakes: [
          { mistake: 'Using column operations when checking consistency of AX = B', penalty: '-3 Marks', remedy: 'Only Elementary ROW Operations are permitted when reducing the augmented matrix [A | B].' },
        ],
        mcqQuestion: 'A system of n linear equations AX = B is consistent with infinitely many solutions when:',
        mcqOptions: [
          'Rank(A) ≠ Rank([A | B])',
          'Rank(A) = Rank([A | B]) = n',
          'Rank(A) = Rank([A | B]) = r < n',
          'det(A) ≠ 0',
        ],
        mcqAnswerIndex: 2,
        mcqExplanation: 'Equal ranks less than the number of variables (r < n) yield infinitely many solutions with (n - r) free variables.',
        pyqYear: 2024,
        pyqSeason: 'May/June',
        pyqQNum: 'Q.5(a)',
      },
    ],
  },
  {
    number: 5,
    title: 'Eigenvalues, Eigenvectors & Cayley-Hamilton Theorem',
    description: 'Characteristic equation |A - λI| = 0, Eigenvalues and Eigenvectors, Cayley-Hamilton Theorem and finding A⁻¹.',
    weightMarks: 13,
    topics: [
      {
        title: 'Cayley-Hamilton Theorem & Finding Matrix Inverse (A⁻¹)',
        weight: 96,
        freq: 97,
        appearances: 6,
        marks5Yr: 42,
        difficulty: 65,
        difficultyLabel: 'Moderate',
        defEn: 'The Cayley-Hamilton Theorem states that every square matrix A satisfies its own characteristic equation det(A - λI) = 0. If the characteristic polynomial of an n×n matrix A is (-1)^n [λ^n + c₁λ^(n-1) + ... + c_n] = 0, then A^n + c₁A^(n-1) + ... + c_n I = O. Multiplying by A⁻¹ gives A⁻¹ directly in terms of powers of A.',
        defHi: 'Cayley-Hamilton Theorem ke anusar har square matrix A apni characteristic equation |A - λI| = 0 ko satisfy karti hai. Equation mein λ ki jagah matrix A aur constant ke sath Identity matrix I rakhkar A⁻¹ aur higher powers (A⁴) aasani se nikale ja sakte hain.',
        analogyTitle: 'A Key That Opens Its Own Lock',
        analogyEn: 'A matrix generates a polynomial equation to find its eigenvalues (λ), and remarkably, plugging the entire matrix A back into that same polynomial zeroes it out completely.',
        analogyHi: 'Matrix se jo characteristic equation λ ke liye banti hai, usi equation mein wapas matrix A rakhne par result Zero Matrix (O) aata hai.',
        typicalQuestion: 'State Cayley-Hamilton Theorem. Verify it for matrix A = [[2, -1, 1], [-1, 2, -1], [1, -1, 2]] and hence find A⁻¹ and A⁴.',
        standardMarks: 10,
        rubricHighlight: '2M for characteristic equation λ³ - S₁λ² + S₂λ - |A| = 0 + 4M for verifying A³ - 6A² + 9A - 4I = O + 4M for deriving A⁻¹.',
        problemStatement: 'Verify Cayley-Hamilton theorem for A = [[2, -1, 1], [-1, 2, -1], [1, -1, 2]] and hence compute A⁻¹.',
        steps: [
          {
            title: 'Find Characteristic Equation: λ³ - S₁λ² + S₂λ - |A| = 0',
            content: 'Compute Trace S₁, sum of diagonal minors S₂, and determinant |A|:',
            codeSnippet: `S₁ = Trace(A) = 2 + 2 + 2 = 6\nS₂ = (4-1) + (4-1) + (4-1) = 3 + 3 + 3 = 9\n|A| = 2(3) - (-1)(-1) + 1(-1) = 4\nCharacteristic Eq: λ³ - 6λ² + 9λ - 4 = 0`,
          },
          {
            title: 'Verify A³ - 6A² + 9A - 4I = O and Multiply by A⁻¹',
            content: 'Isolate 4I and multiply by A⁻¹ to obtain A⁻¹:',
            codeSnippet: `A³ - 6A² + 9A - 4I = O  ==>  4I = A³ - 6A² + 9A\nMultiply by A⁻¹:  4 A⁻¹ = A² - 6A + 9I\nA⁻¹ = (1/4) [ A² - 6A + 9I ]`,
          },
        ],
        mistakes: [
          { mistake: 'Writing scalar 4 instead of matrix 4I in the matrix equation A³ - 6A² + 9A - 4I = O', penalty: '-2 Marks', remedy: 'Never subtract a scalar from a matrix—always multiply the constant term by the Identity Matrix I.' },
        ],
        mcqQuestion: 'If the eigenvalues of a 3×3 matrix A are 1, 2, and 3, then the eigenvalues of A⁻¹ are:',
        mcqOptions: ['1, 2, 3', '-1, -2, -3', '1, 1/2, 1/3', '1, 4, 9'],
        mcqAnswerIndex: 2,
        mcqExplanation: 'If λ is an eigenvalue of an invertible matrix A, then 1/λ is an eigenvalue of A⁻¹.',
        pyqYear: 2024,
        pyqSeason: 'May/June',
        pyqQNum: 'Q.6(a)',
      },
    ],
  },
];

const BT_103_SEEDS: UnitSeed[] = [
  {
    number: 1,
    title: 'Process of Communication, Channels & Barriers',
    description: 'Communication cycle (Sender, Encoding, Channel, Decoding, Feedback), Verbal vs Non-Verbal, Upward/Downward/Horizontal flow, and Semantic/Psychological barriers.',
    weightMarks: 15,
    topics: [
      {
        title: 'Communication Cycle Diagram & Overcoming Barriers to Communication',
        weight: 94,
        freq: 95,
        appearances: 6,
        marks5Yr: 42,
        difficulty: 45,
        difficultyLabel: 'Low',
        defEn: 'Communication is a two-way dynamic process of exchanging ideas and information until mutual understanding is achieved. The Shannon-Weaver Communication Cycle consists of Sender (Ideation) → Encoding → Transmission Channel (affected by Noise) → Receiver → Decoding → Feedback. Barriers are classified into Semantic (language/jargon), Organizational, Psychological (prejudice/emotional filter), and Physical noise.',
        defHi: 'Communication ek two-way process hai jisme Sender se Receiver tak message aur wapas Feedback jata hai. Iske main steps hain: Sender → Encoding → Channel → Receiver → Decoding → Feedback. Barriers char tarah ke hote hain: Semantic (language/jargon), Psychological, Organizational, aur Physical barriers.',
        analogyTitle: 'Radio Broadcast vs Two-Way Walkie-Talkie',
        analogyEn: 'Without the Feedback loop at the end of the cycle, communication is merely a one-way radio broadcast. Feedback turns it into a verified two-way conversation.',
        analogyHi: 'Bina Feedback loop ke communication sirf one-way radio broadcast reh jata hai. Feedback aane par hi communication cycle complete hoti hai.',
        typicalQuestion: 'Define Communication and draw the neat block diagram of the Communication Process Cycle. Explain Semantic, Psychological, and Organizational barriers and how to overcome them.',
        standardMarks: 7,
        rubricHighlight: '3M for labeled Communication Cycle block diagram (with Feedback & Noise) + 2M for classifying barriers + 2M for constructive remedies.',
        problemStatement: 'Draw the 6-stage Communication Process Cycle showing Noise and Feedback Loop, and categorize 4 workplace communication barriers.',
        steps: [
          {
            title: 'Draw the 6-Stage Communication Cycle Block Diagram',
            content: 'Include Noise at the Channel and the return Feedback arrow from Receiver to Sender:',
            codeSnippet: `[Sender / Ideation] --> [Encoding] --> [Channel + Noise] --> [Decoding] --> [Receiver]\n       ^                                                                        |\n       +--------------------------- [Feedback Loop] <---------------------------+`,
          },
          {
            title: 'Classify Barriers & Remedies',
            content: 'Use subheadings for Semantic, Psychological, Organizational, and Physical barriers:',
            codeSnippet: `1. Semantic Barrier: Technical jargon, ambiguous words -> Remedy: Audience-centric clear language.\n2. Psychological Barrier: Premature evaluation, distrust -> Remedy: Active listening & empathy.\n3. Organizational Barrier: Rigid hierarchy -> Remedy: Open-door policy & clear channels.`,
          },
        ],
        mistakes: [
          { mistake: 'Drawing a linear one-way arrow without the return Feedback loop', penalty: '-2 Marks', remedy: 'Always draw the dotted Feedback arrow returning from Receiver to Sender.' },
        ],
        mcqQuestion: 'Which element completes the two-way communication cycle and confirms that the receiver understood the message as intended?',
        mcqOptions: ['Encoding', 'Channel Noise', 'Feedback', 'Grapevine'],
        mcqAnswerIndex: 2,
        mcqExplanation: 'Feedback is the receiver’s response returned to the sender, closing the communication loop.',
        pyqYear: 2024,
        pyqSeason: 'May/June',
        pyqQNum: 'Q.1(a)',
      },
    ],
  },
  {
    number: 2,
    title: 'Technical Writing, 7 Cs of Communication & Report Structure',
    description: 'Characteristics of technical writing vs general writing, 7 Cs of effective communication, and formal structure of technical reports.',
    weightMarks: 15,
    topics: [
      {
        title: 'The 7 Cs of Effective Communication & Technical Report Format',
        weight: 90,
        freq: 92,
        appearances: 5,
        marks5Yr: 35,
        difficulty: 45,
        difficultyLabel: 'Low',
        defEn: 'The 7 Cs of Effective Professional Communication are Clarity, Conciseness, Completeness, Concreteness, Correctness, Courtesy, and Consideration. A formal Technical Report is organized into three parts: (1) Prefatory/Front Matter (Title Page, Letter of Transmittal, Table of Contents, Executive Abstract), (2) Main Body (Introduction, Methodology, Findings/Discussion, Conclusions, Recommendations), and (3) Back Matter (References/Bibliography, Appendices, Glossary).',
        defHi: 'Effective communication ke 7 Cs hain: Clarity, Conciseness, Completeness, Concreteness, Correctness, Courtesy, aur Consideration. Technical Report ke 3 parts hote hain: Front Matter (Title, Abstract), Main Body (Introduction, Methodology, Findings, Recommendations), aur Back Matter (References, Appendix).',
        analogyTitle: 'Engineering Blueprint vs Poetry',
        analogyEn: 'General creative writing is like a painting open to personal interpretation, whereas Technical Writing is like an engineering blueprint—objective, unambiguous, and precise.',
        analogyHi: 'Creative writing ek painting jaisi hai jiske kai arth nikal sakte hain, jabki Technical Writing engineering blueprint jaisi exact aur clear hoti hai.',
        typicalQuestion: 'Explain the 7 Cs of effective communication with suitable examples. Also differentiate between Technical Writing and General/Literary Writing.',
        standardMarks: 7,
        rubricHighlight: '3.5M for all 7 Cs with before/after examples + 3.5M for 6-point tabular comparison of Technical vs General writing.',
        problemStatement: 'Compare Technical Writing and General Writing across Purpose, Tone, Vocabulary, Audience, Structure, and Visual Aids.',
        steps: [
          {
            title: 'Tabular Comparison: Technical vs General Writing',
            content: 'Draw a 3-column table in your exam copy:',
            codeSnippet: `Parameter   | Technical Writing                     | General / Literary Writing\n------------+---------------------------------------+-----------------------------------\n1. Purpose  | To inform, instruct, or persuade      | To entertain, inspire, or express\n2. Tone     | Objective, impersonal, factual        | Subjective, emotional, personal\n3. Visuals  | Tables, flowcharts, graphs, diagrams  | Rarely uses technical graphics`,
          },
        ],
        mistakes: [
          { mistake: 'Confusing Abstract/Summary with Introduction in a Technical Report', penalty: '-1.5 Marks', remedy: 'An Abstract summarizes the entire report including results and conclusions, whereas an Introduction only states background, scope, and objectives.' },
        ],
        mcqQuestion: 'Which of the 7 Cs emphasizes using specific facts and figures instead of vague statements?',
        mcqOptions: ['Courtesy', 'Concreteness', 'Consideration', 'Continuity'],
        mcqAnswerIndex: 1,
        mcqExplanation: 'Concreteness replaces vague claims ("sales rose significantly") with exact facts ("Q3 revenue increased by 24%").',
        pyqYear: 2023,
        pyqSeason: 'Nov/Dec',
        pyqQNum: 'Q.2(a)',
      },
    ],
  },
  {
    number: 3,
    title: 'Business Correspondence: Letters, Memos, Job Applications & Resume',
    description: 'Block format business letters, Inquiry/Quotation/Order/Complaint letters, Notice, Agenda & Minutes of Meeting, and Resume + Cover Letter.',
    weightMarks: 15,
    topics: [
      {
        title: 'Full-Block Business Letter Layout, Job Application & Resume Structure',
        weight: 92,
        freq: 94,
        appearances: 6,
        marks5Yr: 42,
        difficulty: 50,
        difficultyLabel: 'Moderate',
        defEn: 'In the Full-Block Business Letter format, every element (Sender’s Address/Letterhead, Date, Inside Address, Salutation, Subject Line, Body Paragraphs, Complimentary Close, and Signature Block) is aligned flush with the left margin with single-line spacing inside paragraphs and double-line spacing between sections.',
        defHi: 'Full-Block Business Letter format mein saare parts (Sender Address, Date, Receiver Address, Salutation, Subject, Body, aur Signature) left margin se align hote hain. Job Application mein Cover Letter ke sath Chronological ya Skills-based Resume attach kiya jata hai.',
        analogyTitle: 'Professional Dress Code on Paper',
        analogyEn: 'A Full-Block letter layout acts as a clean architectural grid so a busy manager can scan the date, subject, and action item in under 5 seconds.',
        analogyHi: 'Full-Block letter format ek clean grid ki tarah kaam karta hai jisse recruiter 5 second mein Subject aur Main Point padh sake.',
        typicalQuestion: 'Draft a formal Job Application Cover Letter and a structured B.Tech Graduate Resume for the post of Graduate Engineer Trainee at a software/engineering firm.',
        standardMarks: 7,
        rubricHighlight: '3M for Full-Block Cover Letter layout + 4M for boxed Resume (Career Objective, Education Table, Technical Skills, Projects, Declaration).',
        problemStatement: 'Show the exact Full-Block Business Letter template box and mandatory sections of a B.Tech Resume.',
        steps: [
          {
            title: 'Draw the Boxed Full-Block Letter Skeleton',
            content: 'Always enclose formal letters, memos, and notices inside a neat rectangular border in the exam:',
            codeSnippet: `+---------------------------------------------------------------+\n| Sender's Address                                              |\n| Date: 12 October 2026                                         |\n|                                                               |\n| The HR Manager, XYZ Technologies Ltd., Pune                   |\n| Subject: Application for Graduate Engineer Trainee (B.Tech)   |\n| Dear Sir/Madam,                                               |\n| [Para 1: Source of job opening & qualification summary]       |\n| [Para 2: Key projects, technical skills & academic merit]     |\n| [Para 3: Request for interview & enclosed resume reference]   |\n| Yours sincerely,                                              |\n| [Signature & Name]                                            |\n| Encl: Resume (1 Page)                                         |\n+---------------------------------------------------------------+`,
          },
        ],
        mistakes: [
          { mistake: 'Writing apostrophe in "Yours sincerely" as "Your\'s sincerely"', penalty: '-1 Mark', remedy: 'Never put an apostrophe in "Yours sincerely" or "Yours faithfully".' },
        ],
        mcqQuestion: 'In the Full-Block format of a business letter, where are the Date, Complimentary Close, and Signature aligned?',
        mcqOptions: ['Right margin', 'Center of the page', 'Flush with the left margin', 'Alternating left and right'],
        mcqAnswerIndex: 2,
        mcqExplanation: 'In Full-Block format, all components of the letter start at the left margin.',
        pyqYear: 2024,
        pyqSeason: 'May/June',
        pyqQNum: 'Q.3(b)',
      },
    ],
  },
  {
    number: 4,
    title: 'Reading Comprehension, Precis Writing & Oral Presentation',
    description: 'Skimming vs Scanning, Precis writing rules (1/3rd length), Group Discussion (GD) etiquette, and Technical Presentation skills.',
    weightMarks: 13,
    topics: [
      {
        title: 'Precis Writing Rules (One-Third Compression) & Skimming vs Scanning',
        weight: 85,
        freq: 87,
        appearances: 4,
        marks5Yr: 28,
        difficulty: 45,
        difficultyLabel: 'Low',
        defEn: 'A Precis is a clear, compact logical summary of a passage written in the writer’s own words, compressed to strictly one-third (1/3) of the original word count, written in reported speech (third person, past/appropriate tense), with a suitable title and zero personal opinions or direct quotations.',
        defHi: 'Precis kisi passage ka 1/3 (ek-tihai) words mein likha gaya crisp summary hota hai. Isme suitable Title dena zaroori hai, aur ise hamesha third-person (indirect speech) mein bina apni personal opinion jode apne shabdon mein likha jata hai.',
        analogyTitle: 'Concentrated Orange Juice Extract',
        analogyEn: 'A Precis removes the water (illustrations, repetitions, rhetorical flourishes) while keeping 100% of the nutritional core ideas in 1/3rd the volume.',
        analogyHi: 'Precis passage mein se extra examples aur repetition hata kar sirf main core idea ko 1/3rd words mein rakhne ka tarika hai.',
        typicalQuestion: 'State the essential rules of Precis Writing. Differentiate between Skimming and Scanning reading techniques with examples.',
        standardMarks: 7,
        rubricHighlight: '3.5M for 6 rules of Precis writing (1/3rd count, Title, Third-person, No quotes) + 3.5M for Skimming vs Scanning comparison.',
        problemStatement: 'Outline the step-by-step method to reduce a 300-word passage into a 100-word Precis with a title and word-count grid.',
        steps: [
          {
            title: 'Follow the 4-Step Exam Precis Checklist',
            content: 'Always write the word count at the bottom of your Precis in brackets:',
            codeSnippet: `1. Title: Give a short, apt 4-6 word title centered at the top.\n2. Length: Target exactly N/3 words (±5 words), e.g., 300 words -> 100 words.\n3. Voice: Use Third-Person Indirect Speech ("The author states that...").\n4. Footer: Write [Original Words: 300 | Precis Words: 98] at the bottom right.`,
          },
        ],
        mistakes: [
          { mistake: 'Copying sentences verbatim from the passage or omitting the Title', penalty: '-2 Marks', remedy: 'Always supply a Title (carries 1–2 marks) and rephrase ideas in your own words.' },
        ],
        mcqQuestion: 'What is the standard target length of a Precis compared to the original passage?',
        mcqOptions: ['Half (1/2) of original length', 'One-third (1/3) of original length', 'Three-fourths (3/4) of original length', 'Equal to original length'],
        mcqAnswerIndex: 1,
        mcqExplanation: 'A standard precis condenses the original passage to approximately one-third (1/3) of its total word count.',
        pyqYear: 2023,
        pyqSeason: 'May/June',
        pyqQNum: 'Q.4(b)',
      },
    ],
  },
  {
    number: 5,
    title: 'Applied Grammar, Vocabulary & Phonetics',
    description: 'Active/Passive Voice, Direct/Indirect Speech, Subject-Verb Agreement, Synonyms/Antonyms, Prefixes/Suffixes, and IPA Phonetic Transcription.',
    weightMarks: 12,
    topics: [
      {
        title: 'Active-Passive Voice, Subject-Verb Agreement & Technical Vocabulary',
        weight: 84,
        freq: 86,
        appearances: 5,
        marks5Yr: 35,
        difficulty: 50,
        difficultyLabel: 'Low',
        defEn: 'In Technical Writing, Passive Voice (Object + Auxiliary Verb + V3 Past Participle) is preferred when the action or experimental procedure is more important than the actor (e.g., "The solution was heated to 80°C"). Subject-Verb Agreement ensures singular subjects take singular verbs and plural subjects take plural verbs.',
        defHi: 'Technical aur lab reports mein Passive Voice (Object + Helping Verb + V3) ka use hota hai kyunki wahan action zyada important hota hai (jaise "The circuit was tested"). Subject-Verb agreement ke rules collective nouns aur conjunctions (neither...nor) ke sath dhyan se lagaye jate hain.',
        analogyTitle: 'Spotlight on the Experiment, Not the Scientist',
        analogyEn: 'Active voice puts the spotlight on the person ("I measured the voltage"), while Passive voice puts the spotlight on the engineering process ("The voltage was measured across R1").',
        analogyHi: 'Active voice vyakti par focus karta hai, jabki Passive voice experiment ya process par focus karta hai.',
        typicalQuestion: 'State the rules for converting Active Voice into Passive Voice across tenses, and explain why Passive Voice is widely used in scientific and engineering reports.',
        standardMarks: 7,
        rubricHighlight: '4M for tense conversion table (Active -> Passive) + 3M for scientific objectivity justification & examples.',
        problemStatement: 'Convert technical statements between Active and Passive Voice and apply Subject-Verb agreement rules.',
        steps: [
          {
            title: 'Master the Tense Conversion Formula',
            content: 'Only transitive verbs take passive voice using Be-verb + Past Participle (V3):',
            codeSnippet: `Present Simple:   Active: S + V1 + O         --> Passive: O + is/am/are + V3 + by S\nPresent Cont.:    Active: S + is/are + V-ing --> Passive: O + is/are + being + V3\nPresent Perfect:  Active: S + has/have + V3  --> Passive: O + has/have + been + V3\nPast Simple:      Active: S + V2 + O         --> Passive: O + was/were + V3 + by S`,
          },
        ],
        mistakes: [
          { mistake: 'Using plural verb with "Each of", "Everyone", or "One of the..."', penalty: '-1 Mark', remedy: '"One of the motors IS faulty" (singular verb agrees with "One", not "motors").' },
        ],
        mcqQuestion: 'Choose the grammatically correct sentence under Subject-Verb Agreement rules:',
        mcqOptions: [
          'Neither the manager nor the engineers was present.',
          'Neither the manager nor the engineers were present.',
          'One of the instruments are calibrated.',
          'The quality of the steel beams are tested.',
        ],
        mcqAnswerIndex: 1,
        mcqExplanation: 'With "Neither...nor", the verb agrees with the closer subject ("engineers" -> plural "were").',
        pyqYear: 2024,
        pyqSeason: 'May/June',
        pyqQNum: 'Q.5(a)',
      },
    ],
  },
];

const BT_104_SEEDS: UnitSeed[] = [
  {
    number: 1,
    title: 'DC Circuits: KCL, KVL, Thevenin, Norton & Superposition Theorems',
    description: 'Ohm’s law, Kirchhoff’s Current & Voltage laws, Mesh & Nodal analysis, Star-Delta transformation, Thevenin’s, Norton’s, and Maximum Power Transfer theorems.',
    weightMarks: 16,
    topics: [
      {
        title: 'Thevenin’s Theorem, Norton’s Theorem & Mesh/Nodal Analysis',
        weight: 96,
        freq: 97,
        appearances: 6,
        marks5Yr: 42,
        difficulty: 72,
        difficultyLabel: 'High Cognitive Load',
        defEn: 'Thevenin’s Theorem states that any linear, bilateral two-terminal DC network containing independent/dependent sources and resistors can be replaced at terminals A-B by a single equivalent voltage source V_th (open-circuit voltage across A-B) in series with an equivalent resistance R_th (resistance looking into A-B with independent voltage sources shorted and current sources opened). Load current is I_L = V_th / (R_th + R_L).',
        defHi: 'Thevenin’s Theorem ke anusar kisi bhi linear two-terminal DC circuit ko ek single voltage source V_th aur series resistance R_th se replace kiya ja sakta hai. R_th nikalte samay independent voltage source ko short-circuit aur current source ko open-circuit karte hain. Load current I_L = V_th / (R_th + R_L) hota hai.',
        analogyTitle: 'Replacing a Complex Power Grid with One Battery + Internal Resistor',
        analogyEn: 'When you plug your phone charger into a wall socket, your phone doesn’t care about the 1000 power lines behind the wall—to the load R_L, the entire grid behaves like a single battery V_th with internal resistance R_th.',
        analogyHi: 'Wall socket ke piche kitna bhi bada circuit ho, load R_L ke liye wo pura circuit ek single battery (V_th) aur series resistance (R_th) jaisa kaam karta hai.',
        typicalQuestion: 'State and explain Thevenin’s Theorem step-by-step. Find the current through the load resistor R_L = 10 Ω connected across terminals A-B of a bridge/two-loop DC circuit.',
        standardMarks: 7,
        rubricHighlight: '2M for Thevenin statement & equivalent circuit diagram + 2.5M for V_th calculation + 2.5M for R_th & I_L calculation.',
        problemStatement: 'A circuit has a 24V source in series with R1 = 6Ω, parallel branch R2 = 12Ω across A-B, and series resistor R3 = 2Ω before load R_L = 10Ω. Find V_th, R_th, and load current I_L.',
        steps: [
          {
            title: 'Step 1: Remove Load R_L and Find Open-Circuit Voltage V_th',
            content: 'With R_L removed, no current flows through R3 = 2Ω. Apply voltage divider across R1 = 6Ω and R2 = 12Ω:',
            codeSnippet: `V_th = V_AB(open) = 24V × [ R2 / (R1 + R2) ] = 24 × [ 12 / (6 + 12) ] = 16 V`,
          },
          {
            title: 'Step 2: Short the 24V Source and Find R_th Across A-B',
            content: 'R1 (6Ω) and R2 (12Ω) are in parallel, in series with R3 (2Ω):',
            codeSnippet: `R_th = (R1 || R2) + R3 = (6 × 12)/(6 + 12) + 2 = 4 + 2 = 6 Ω`,
          },
          {
            title: 'Step 3: Connect R_L = 10Ω to Thevenin Equivalent Circuit',
            content: 'Compute load current I_L:',
            codeSnippet: `I_L = V_th / (R_th + R_L) = 16 / (6 + 10) = 16 / 16 = 1.0 A`,
          },
        ],
        mistakes: [
          { mistake: 'Opening voltage sources or shorting current sources when finding R_th', penalty: '-2.5 Marks', remedy: 'Remember: Voltage source (R_internal = 0) -> SHORT CIRCUIT; Current source (R_internal = ∞) -> OPEN CIRCUIT.' },
        ],
        mcqQuestion: 'For Maximum Power Transfer in a DC circuit, the load resistance R_L must be equal to:',
        mcqOptions: ['Zero (0 Ω)', 'Half of R_th (R_th / 2)', 'Thevenin resistance R_th', 'Twice R_th (2 R_th)'],
        mcqAnswerIndex: 2,
        mcqExplanation: 'Maximum power P_max = V_th² / (4 R_th) is transferred to the load when R_L = R_th.',
        pyqYear: 2024,
        pyqSeason: 'May/June',
        pyqQNum: 'Q.1(a)',
      },
    ],
  },
  {
    number: 2,
    title: 'Single-Phase & Three-Phase AC Circuits',
    description: 'RMS & Average value, Form/Peak factor, RLC Series Resonance, Active/Reactive/Apparent power, and Star vs Delta 3-Phase relations.',
    weightMarks: 15,
    topics: [
      {
        title: 'Series RLC Resonance, Power Factor & 3-Phase Star-Delta Relations',
        weight: 93,
        freq: 94,
        appearances: 5,
        marks5Yr: 35,
        difficulty: 70,
        difficultyLabel: 'Moderate',
        defEn: 'In a Series RLC AC circuit, Resonance occurs when inductive reactance equals capacitive reactance (X_L = X_C), giving resonant frequency f_r = 1 / (2π√(LC)), minimum impedance Z = R, maximum current I = V/R, and unity power factor (cos φ = 1). In balanced 3-phase systems: for Star (Y), V_L = √3 V_ph and I_L = I_ph; for Delta (Δ), V_L = V_ph and I_L = √3 I_ph; Total Power P = √3 V_L I_L cos φ.',
        defHi: 'Series RLC circuit mein Resonance tab hota hai jab X_L = X_C ho, jahan resonant frequency f_r = 1 / (2π√(LC)), impedance minimum Z = R, aur power factor cos φ = 1 hota hai. 3-Phase Star (Y) connection mein V_L = √3 V_ph aur I_L = I_ph hota hai, jabki Delta (Δ) mein V_L = V_ph aur I_L = √3 I_ph hota hai.',
        analogyTitle: 'Pushing a Swing at Its Natural Frequency',
        analogyEn: 'At resonant frequency f_r, the inductor and capacitor exchange reactive energy back and forth between their magnetic and electric fields, cancelling each other out so the source sees only pure resistance R.',
        analogyHi: 'Resonance par Inductor aur Capacitor ek dusre ke reactive effect ko cancel kar dete hain (X_L = X_C), isliye circuit pure resistive (Z = R) ban jata hai.',
        typicalQuestion: 'Derive the expression for resonant frequency f_r = 1 / (2π√(LC)) in a Series RLC circuit with phasor diagram. Also prove that V_L = √3 V_ph in a balanced 3-phase Star (Y) connection.',
        standardMarks: 7,
        rubricHighlight: '3M for RLC phasor diagram & f_r derivation + 2M for Q-factor & bandwidth + 2M for 3-phase Star phasor proof.',
        problemStatement: 'A series RLC circuit with R = 10 Ω, L = 0.1 H, and C = 100 μF is connected across 200V, 50Hz AC supply. Find impedance Z, current I, power factor cos φ, and resonant frequency f_r.',
        steps: [
          {
            title: 'Calculate Reactances X_L and X_C at f = 50 Hz',
            content: 'Use X_L = 2πfL and X_C = 1 / (2πfC):',
            codeSnippet: `X_L = 2 × π × 50 × 0.1 = 31.42 Ω\nX_C = 1 / (2 × π × 50 × 100×10⁻⁶) = 31.83 Ω`,
          },
          {
            title: 'Calculate Impedance Z, Current I, Power Factor & Resonant Frequency f_r',
            content: 'Apply impedance triangle formulas:',
            codeSnippet: `Z = √[ R² + (X_L - X_C)² ] = √[ 10² + (-0.41)² ] = 10.008 Ω\nI = V / Z = 200 / 10.008 = 19.98 A\ncos φ = R / Z = 10 / 10.008 = 0.999 (Leading since X_C > X_L)\nf_r = 1 / [ 2π√(0.1 × 100×10⁻⁶) ] = 50.33 Hz`,
          },
        ],
        mistakes: [
          { mistake: 'Writing Power P = V × I instead of P = V × I × cos φ in AC circuits', penalty: '-1.5 Marks', remedy: 'In AC circuits, V×I is Apparent Power (VA); True Active Power (Watts) always includes the power factor cos φ.' },
        ],
        mcqQuestion: 'At resonance in a Series RLC AC circuit, what is the power factor (cos φ) of the circuit?',
        mcqOptions: ['Zero (0)', '0.5 Lagging', '0.707 Leading', 'Unity (1.0)'],
        mcqAnswerIndex: 3,
        mcqExplanation: 'At resonance, X_L = X_C so phase angle φ = 0° and power factor cos(0°) = 1 (Unity).',
        pyqYear: 2024,
        pyqSeason: 'May/June',
        pyqQNum: 'Q.2(b)',
      },
    ],
  },
  {
    number: 3,
    title: 'Single-Phase Transformers & Magnetic Circuits',
    description: 'Working principle of transformer, EMF equation E = 4.44 f N Φ_m, Core (Hysteresis + Eddy current) vs Copper losses, Efficiency, and Open/Short-Circuit tests.',
    weightMarks: 15,
    topics: [
      {
        title: 'Transformer EMF Equation Derivation, Losses & Efficiency Condition',
        weight: 97,
        freq: 98,
        appearances: 6,
        marks5Yr: 42,
        difficulty: 65,
        difficultyLabel: 'Moderate',
        defEn: 'A transformer is a static electromagnetic device that transfers AC electrical power from one circuit to another at constant frequency via mutual induction (Faraday’s Law). The RMS induced EMF is E₁ = 4.44 f N₁ Φ_m and E₂ = 4.44 f N₂ Φ_m. Maximum efficiency occurs when Variable Copper Losses equal Constant Iron (Core) Losses (I₂² R₀₂ = P_i).',
        defHi: 'Transformer ek static device hai jo mutual induction ke principle par constant frequency ke sath AC voltage step-up ya step-down karta hai. Iska RMS EMF equation E = 4.44 f N Φ_m Volts hota hai. Transformer ki efficiency tab maximum hoti hai jab Copper Loss = Iron Core Loss (P_cu = P_i) ho.',
        analogyTitle: 'Gearbox for Voltage and Current',
        analogyEn: 'Just as a bicycle gear steps up torque while stepping down speed at constant mechanical power, a transformer steps up voltage while stepping down current at constant electrical power (V₁I₁ = V₂I₂) and constant frequency.',
        analogyHi: 'Jaise cycle ka gear power constant rakhkar speed aur torque badalta hai, transformer power aur frequency constant rakhkar voltage aur current ko step-up/step-down karta hai.',
        typicalQuestion: 'Derive the EMF Equation of a Single-Phase Transformer (E = 4.44 f N Φ_m). Explain Hysteresis and Eddy Current core losses and how they are minimized.',
        standardMarks: 7,
        rubricHighlight: '3.5M for step-by-step derivation of E = 4.44 f N Φ_m + 2M for Hysteresis (CRGO silicon steel) & Eddy current (laminations) + 1.5M for efficiency formula.',
        problemStatement: 'A 25 kVA, 2000/200 V, 50 Hz single-phase transformer has 80 secondary turns. Calculate: (i) Primary turns N₁, (ii) Full-load primary and secondary currents, and (iii) Maximum flux Φ_m in the core.',
        steps: [
          {
            title: 'Derivation of E = 4.44 f N Φ_m',
            content: 'Flux Φ = Φ_m sin(ωt) reaches Φ_m in quarter cycle t = 1/(4f):',
            codeSnippet: `Average EMF per turn = dΦ / dt = Φ_m / (1 / 4f) = 4 f Φ_m Volts\nSince Form Factor of sine wave = RMS / Average = 1.11:\nRMS EMF per turn = 1.11 × 4 f Φ_m = 4.44 f Φ_m\nFor N turns:  E₁ = 4.44 f N₁ Φ_m   and   E₂ = 4.44 f N₂ Φ_m Volts`,
          },
          {
            title: 'Solve Numerical for N₁, Currents & Maximum Flux Φ_m',
            content: 'Substitute E₁ = 2000 V, E₂ = 200 V, N₂ = 80, f = 50 Hz:',
            codeSnippet: `N₁ = N₂ × (E₁ / E₂) = 80 × (2000 / 200) = 800 turns\nI₁ = 25000 / 2000 = 12.5 A;   I₂ = 25000 / 200 = 125 A\nΦ_m = E₂ / (4.44 × f × N₂) = 200 / (4.44 × 50 × 80) = 0.01126 Weber (11.26 mWb)`,
          },
        ],
        mistakes: [
          { mistake: 'Confusing why silicon steel vs laminations are used in transformer cores', penalty: '-2 Marks', remedy: 'High-grade Silicon Steel (CRGO) reduces HYSTERESIS loss; Thin Insulated Laminations (0.35–0.5 mm) reduce EDDY CURRENT loss.' },
        ],
        mcqQuestion: 'Why is the core of a power transformer constructed from thin insulated silicon steel laminations?',
        mcqOptions: [
          'To increase eddy current and heat the windings',
          'Silicon steel reduces hysteresis loss and thin laminations reduce eddy current loss',
          'To reduce copper winding resistance',
          'To step up the supply frequency from 50 Hz to 400 Hz',
        ],
        mcqAnswerIndex: 1,
        mcqExplanation: 'Silicon steel has narrow hysteresis loops (low hysteresis loss), and insulated laminations break eddy current paths (low eddy current loss).',
        pyqYear: 2024,
        pyqSeason: 'May/June',
        pyqQNum: 'Q.3(a)',
      },
    ],
  },
  {
    number: 4,
    title: 'Electrical Machines: DC Machines & 3-Phase Induction Motors',
    description: 'Construction & working of DC Generator/Motor, Back EMF E_b = (Φ Z N P)/(60 A), and Rotating Magnetic Field & Slip in 3-Phase Induction Motors.',
    weightMarks: 12,
    topics: [
      {
        title: 'DC Machine Construction, Back EMF & 3-Phase Induction Motor Slip',
        weight: 88,
        freq: 90,
        appearances: 5,
        marks5Yr: 35,
        difficulty: 65,
        difficultyLabel: 'Moderate',
        defEn: 'In a DC Machine, the Yoke provides mechanical protection and magnetic return path, Field Poles produce flux Φ, Armature Core houses conductors Z, and the Split-Ring Commutator converts alternating armature EMF into unidirectional DC. Back EMF is E_b = (Φ Z N P) / (60 A) where A = P (Lap winding) or A = 2 (Wave winding). In a 3-Phase Induction Motor, Synchronous Speed is N_s = 120f / P and fractional Slip is s = (N_s - N_r) / N_s.',
        defHi: 'DC Machine mein Split-Ring Commutator AC induced EMF ko DC mein convert karta hai. Iska Back EMF formula E_b = (Φ Z N P) / (60 A) hai, jahan Lap winding ke liye A = P aur Wave winding ke liye A = 2 hota hai. 3-Phase Induction Motor mein Synchronous speed N_s = 120f / P aur Slip s = (N_s - N_r) / N_s hoti hai.',
        analogyTitle: 'Lap Winding (High Current) vs Wave Winding (High Voltage)',
        analogyEn: 'Lap winding connects coils in parallel paths (A = P) like a multi-lane highway for heavy current, whereas Wave winding connects them in just 2 series paths (A = 2) for high voltage.',
        analogyHi: 'Lap winding (A = P) high current aur low voltage ke liye hoti hai, jabki Wave winding (A = 2) high voltage aur low current ke liye hoti hai.',
        typicalQuestion: 'Draw the cross-sectional view of a DC Machine and explain the function of Yoke, Poles, Armature, and Commutator. Also derive the EMF equation E = (Φ Z N P)/(60 A).',
        standardMarks: 7,
        rubricHighlight: '3M for labeled cross-section of 4-pole DC machine + 2M for function of Commutator & Brushes + 2M for EMF equation & Lap/Wave condition.',
        problemStatement: 'A 4-pole, 50 Hz, 3-phase induction motor runs at 1440 RPM on full load. Calculate: (i) Synchronous speed N_s, (ii) Percentage slip s, and (iii) Rotor current frequency f_r.',
        steps: [
          {
            title: 'Calculate Synchronous Speed N_s and Slip s',
            content: 'Use N_s = 120f / P and s = (N_s - N_r) / N_s:',
            codeSnippet: `N_s = (120 × 50) / 4 = 1500 RPM\nSlip s = (1500 - 1440) / 1500 = 60 / 1500 = 0.04 (or 4%)\nRotor frequency f_r = s × f = 0.04 × 50 = 2 Hz`,
          },
        ],
        mistakes: [
          { mistake: 'Using Rotor frequency f_r = f instead of f_r = s · f', penalty: '-1.5 Marks', remedy: 'At standstill (s=1), rotor frequency equals supply frequency f; when running, rotor frequency is f_r = s × f.' },
        ],
        mcqQuestion: 'What is the number of parallel paths (A) in the armature of a 6-pole DC machine having Wave Winding?',
        mcqOptions: ['A = 6', 'A = 12', 'A = 2', 'A = 3'],
        mcqAnswerIndex: 2,
        mcqExplanation: 'In Wave winding, the number of parallel paths is always A = 2 regardless of the number of poles P (whereas in Lap winding, A = P = 6).',
        pyqYear: 2023,
        pyqSeason: 'Nov/Dec',
        pyqQNum: 'Q.4(a)',
      },
    ],
  },
  {
    number: 5,
    title: 'Basic Electronics: PN Diode Rectifiers, BJT & Digital Logic Gates',
    description: 'PN junction V-I characteristics, Half-wave & Full-wave Bridge rectifiers, BJT CE/CB/CC configurations, and Universal Logic Gates (NAND/NOR).',
    weightMarks: 12,
    topics: [
      {
        title: 'Half-Wave vs Full-Wave Bridge Rectifier, BJT Configurations & Universal Gates',
        weight: 90,
        freq: 92,
        appearances: 5,
        marks5Yr: 35,
        difficulty: 55,
        difficultyLabel: 'Moderate',
        defEn: 'A Full-Wave Bridge Rectifier uses 4 PN junction diodes to convert both positive and negative half-cycles of AC into pulsating DC, achieving maximum rectification efficiency η = 81.2% and ripple factor γ = 0.482 (compared to η = 40.6% and γ = 1.21 for Half-Wave). NAND and NOR gates are Universal Gates because any Boolean function (AND, OR, NOT, XOR) can be implemented using only NAND or only NOR gates.',
        defHi: 'Full-Wave Bridge Rectifier 4 diodes ki madad se AC ke dono half-cycles ko pulsating DC mein badalta hai, jiski efficiency 81.2% aur ripple factor 0.482 hota hai (Half-Wave mein 40.6%). NAND aur NOR ko Universal Gates kehte hain kyunki inse koi bhi logic gate (NOT, AND, OR) banaya ja sakta hai.',
        analogyTitle: 'One-Way Check Valves in a Water Bridge',
        analogyEn: 'Diodes act like one-way check valves. In a 4-diode bridge, whether AC pushes water forward (D1, D2 open) or pulls backward (D3, D4 open), water through the load R_L always flows in the exact same direction.',
        analogyHi: 'Bridge rectifier ke 4 diodes one-way valves ki tarah kaam karte hain: positive half-cycle mein D1-D2 conduct karte hain aur negative mein D3-D4, jisse load R_L mein current hamesha ek hi direction mein behta hai.',
        typicalQuestion: 'Compare Half-Wave, Center-Tapped Full-Wave, and Bridge Rectifier with circuit diagrams and input/output waveforms. Also realize NOT, AND, and OR gates using only NAND gates.',
        standardMarks: 7,
        rubricHighlight: '3M for Bridge circuit & waveforms + 2M for comparison table (η, Ripple factor, PIV) + 2M for NAND universal gate realization.',
        problemStatement: 'Compare Half-Wave, Center-Tap Full-Wave, and Bridge Rectifier across Number of Diodes, Efficiency (η), Ripple Factor (γ), and Peak Inverse Voltage (PIV).',
        steps: [
          {
            title: 'Draw the Rectifier Comparison Table',
            content: 'Include this high-scoring 4-row table in every rectifier exam answer:',
            codeSnippet: `Parameter              | Half-Wave (HWR) | Center-Tap FWR | Bridge Rectifier\n-----------------------+-----------------+----------------+-----------------\nNumber of Diodes       | 1               | 2              | 4\nMax Efficiency (η)     | 40.6 %          | 81.2 %         | 81.2 %\nRipple Factor (γ)      | 1.21            | 0.482          | 0.482\nPeak Inverse Volt (PIV)| V_m             | 2 V_m          | V_m`,
          },
        ],
        mistakes: [
          { mistake: 'Writing PIV of Bridge Rectifier as 2V_m', penalty: '-1.5 Marks', remedy: 'Center-tapped FWR has PIV = 2V_m, whereas Bridge Rectifier has PIV = V_m (major advantage of Bridge FWR).' },
        ],
        mcqQuestion: 'What is the maximum rectification efficiency (η) and ripple factor (γ) of a Full-Wave Bridge Rectifier?',
        mcqOptions: [
          'η = 40.6%, γ = 1.21',
          'η = 81.2%, γ = 0.482',
          'η = 100%, γ = 0',
          'η = 50.0%, γ = 1.11',
        ],
        mcqAnswerIndex: 1,
        mcqExplanation: 'Full-wave rectifiers achieve 81.2% maximum efficiency and 0.482 ripple factor.',
        pyqYear: 2024,
        pyqSeason: 'May/June',
        pyqQNum: 'Q.5(b)',
      },
    ],
  },
];

const BT_105_SEEDS: UnitSeed[] = [
  {
    number: 1,
    title: 'Engineering Scales & Conic Sections (Ellipse, Parabola, Cycloid)',
    description: 'Representative Fraction (RF), Plain & Diagonal Scales, Vernier Scale, Conic sections by Eccentricity method, Cycloid, Epicycloid, and Involutes.',
    weightMarks: 16,
    topics: [
      {
        title: 'Representative Fraction (RF), Diagonal Scale & Conic Sections by Eccentricity',
        weight: 96,
        freq: 97,
        appearances: 6,
        marks5Yr: 42,
        difficulty: 65,
        difficultyLabel: 'Moderate',
        defEn: 'Representative Fraction (RF) is the ratio of the length of an object on the drawing to its actual real-world length (in the same units). A Diagonal Scale measures three consecutive units (e.g., meters, decimeters, centimeters) using the principle of similar triangles. A Conic Section is the locus of a point moving in a plane such that the ratio of its distance from a fixed point (Focus F) to a fixed straight line (Directrix) is constant, called Eccentricity (e < 1 for Ellipse, e = 1 for Parabola, e > 1 for Hyperbola).',
        defHi: 'Representative Fraction (RF) = Drawing par length / Object ki actual length (same unit mein). Diagonal Scale similar triangles ke principle par 3 consecutive units (jaise m, dm, cm) napta hai. Conic section mein Focus se distance aur Directrix se distance ka ratio Eccentricity (e) kehlata hai: Ellipse (e < 1), Parabola (e = 1), Hyperbola (e > 1).',
        analogyTitle: 'Google Maps Zoom Ratio (RF)',
        analogyEn: 'RF = 1 : 100 means 1 cm on your drawing sheet represents 100 cm (1 meter) on the real site, and diagonal subdivisions let you read down to a tenth of a millimeter.',
        analogyHi: 'RF = 1 : 100 ka matlab hai drawing sheet par 1 cm asal zameen ke 100 cm (1 meter) ke barabar hai.',
        typicalQuestion: 'Construct a Diagonal Scale of RF = 1 / 4000 to show meters, decameters, and hectometers and long enough to measure up to 500 meters. Mark a distance of 374 meters on it.',
        standardMarks: 7,
        rubricHighlight: '2M for RF & Length of Scale (LOS) calculation + 3M for neat 10×10 diagonal grid construction + 2M for dimensioning 374 m.',
        problemStatement: 'Calculate Length of Scale (LOS) for RF = 1/4000 to measure up to 500 m, and explain the construction steps to mark 374 m.',
        steps: [
          {
            title: 'Step 1: Compute Representative Fraction (RF) and Length of Scale (LOS)',
            content: 'Always write RF and LOS in bold before starting the drawing:',
            codeSnippet: `RF = 1 / 4000\nMaximum Length (L_max) = 500 meters = 500 × 100 cm = 50,000 cm\nLength of Scale (LOS) = RF × L_max = (1 / 4000) × 50,000 cm = 12.5 cm`,
          },
          {
            title: 'Step 2: Divide into Main, Sub, and Diagonal Divisions',
            content: 'Draw a 12.5 cm horizontal line and 5 cm vertical height:',
            codeSnippet: `1. Divide 12.5 cm line into 5 equal parts (each = 100 m / 1 hectometer).\n2. Divide the first left part into 10 sub-divisions (each = 10 m / 1 decameter).\n3. Draw 10 equidistant horizontal parallels vertically and join diagonals (each step = 1 m).\n4. Mark 374 m at: 3rd main division (300m) + 7th sub-division (70m) + 4th upward diagonal (4m).`,
          },
        ],
        mistakes: [
          { mistake: 'Forgetting to convert meters to centimeters when calculating Length of Scale (LOS)', penalty: '-2 Marks', remedy: 'LOS on a drawing sheet must always be in centimeters (typically between 10 cm and 20 cm).' },
        ],
        mcqQuestion: 'For an Ellipse constructed by the Focus-Directrix (General Eccentricity) method, the eccentricity e satisfies:',
        mcqOptions: ['e = 1', 'e < 1', 'e > 1', 'e = 0'],
        mcqAnswerIndex: 1,
        mcqExplanation: 'Eccentricity e = Distance from Focus / Distance from Directrix is < 1 for an Ellipse, = 1 for a Parabola, and > 1 for a Hyperbola.',
        pyqYear: 2024,
        pyqSeason: 'May/June',
        pyqQNum: 'Q.1(a)',
      },
    ],
  },
  {
    number: 2,
    title: 'Orthographic Projections of Points & Straight Lines',
    description: 'First-angle vs Third-angle projection, Projections of points in all 4 quadrants, and Lines inclined to both HP and VP + Traces.',
    weightMarks: 15,
    topics: [
      {
        title: 'Projections of Points in 4 Quadrants & Line Inclined to Both HP and VP',
        weight: 94,
        freq: 95,
        appearances: 6,
        marks5Yr: 42,
        difficulty: 75,
        difficultyLabel: 'High Cognitive Load',
        defEn: 'In Orthographic Projection (First-Angle Projection used by BIS/RGPV), the Horizontal Plane (HP) is rotated 90° clockwise below the XY reference line. Thus, for a point in the 1st Quadrant (Above HP, In front of VP), the Front View (a\') lies ABOVE XY and the Top View (a) lies BELOW XY. For a straight line inclined at θ to HP and φ to VP, neither view shows true length directly unless rotated parallel to the reference plane.',
        defHi: 'First-Angle Projection mein HP ko XY reference line ke niche 90° clockwise ghuma diya jata hai. Isliye 1st Quadrant (Above HP, In front of VP) mein Front View (a\') XY ke UPAR aur Top View (a) XY ke NICHE banta hai. Jab line HP (θ) aur VP (φ) dono se inclined ho, toh locus method se True Length aur Apparent angles (α, β) banate hain.',
        analogyTitle: 'Opening a Laptop Screen to 180° Flat',
        analogyEn: 'Imagine VP as your upright laptop screen and HP as the keyboard. Opening the keyboard flat downward puts the Front View on the top half and the Top View on the bottom half across the hinge line XY.',
        analogyHi: 'VP ko laptop screen aur HP ko keyboard samjhiye. Keyboard ko 90° niche kholne par hinge line XY ke upar Front View aur niche Top View aa jata hai.',
        typicalQuestion: 'A line AB 80 mm long has its end A 20 mm above HP and 30 mm in front of VP. The line is inclined at 30° to HP and 45° to VP. Draw its projections and find apparent lengths and inclinations.',
        standardMarks: 10,
        rubricHighlight: '2M for marking end A (a\' 20mm above XY, a 30mm below XY) + 4M for true-length arcs & loci of b\' and b + 4M for darkened final views a\'b\' and ab.',
        problemStatement: 'State the position of Front View (a\') and Top View (a) relative to the XY line across all 4 quadrants.',
        steps: [
          {
            title: 'Master the 4-Quadrant Rule Relative to XY Line',
            content: 'Memorize this rule: "Above HP => a\' above XY; In front of VP => a below XY":',
            codeSnippet: `1st Quadrant (Above HP, In front of VP): Front View (a') ABOVE XY | Top View (a) BELOW XY\n2nd Quadrant (Above HP, Behind VP):      Both Front View (a') & Top View (a) ABOVE XY\n3rd Quadrant (Below HP, Behind VP):      Front View (a') BELOW XY | Top View (a) ABOVE XY\n4th Quadrant (Below HP, In front of VP): Both Front View (a') & Top View (a) BELOW XY`,
          },
        ],
        mistakes: [
          { mistake: 'Drawing final projections a\'b\' and ab with light 2H lines instead of dark HB lines', penalty: '-2 Marks', remedy: 'Construction/projector lines must be thin 2H lines, while final Front View (a\'b\') and Top View (ab) must be bold dark HB lines.' },
        ],
        mcqQuestion: 'If a point P lies in the 2nd Quadrant (above HP and behind VP), where do its Front View (p\') and Top View (p) lie with respect to the XY reference line?',
        mcqOptions: [
          'p\' above XY and p below XY',
          'Both p\' and p lie above the XY line',
          'p\' below XY and p above XY',
          'Both p\' and p lie below the XY line',
        ],
        mcqAnswerIndex: 1,
        mcqExplanation: 'In the 2nd quadrant, rotating the rear HP 90° clockwise brings the Top View above XY alongside the Front View.',
        pyqYear: 2024,
        pyqSeason: 'May/June',
        pyqQNum: 'Q.2(a)',
      },
    ],
  },
  {
    number: 3,
    title: 'Projections of Planes & Regular Solids (Prism, Pyramid, Cone, Cylinder)',
    description: 'Two-stage & three-stage projections of polygonal/circular planes and right regular solids inclined to HP and VP.',
    weightMarks: 14,
    topics: [
      {
        title: 'Three-Stage Projection of Solids (Axis Inclined to HP or VP)',
        weight: 89,
        freq: 91,
        appearances: 5,
        marks5Yr: 35,
        difficulty: 72,
        difficultyLabel: 'High Cognitive Load',
        defEn: 'When a solid’s axis is inclined to HP, the projection is drawn in two/three stages using the Change-of-Position method: In Stage 1, assume the axis perpendicular to HP so the Top View shows the true shape of the base; in Stage 2, tilt the Stage 1 Front View so the axis makes the given angle θ with HP, and project downward to obtain the final foreshortened Top View.',
        defHi: 'Jab kisi solid (Pentagonal Pyramid/Cylinder) ki axis HP se θ angle par inclined ho, toh Stage 1 mein axis ko HP ke perpendicular maante hain (jisse Top View mein base ka True Shape dikhe), aur Stage 2 mein Front View ko θ angle par tilt karke final Top View project karte hain.',
        analogyTitle: 'Standing Straight Before Tilting for a Photo',
        analogyEn: 'You cannot draw a tilted pyramid directly. First draw it standing upright (Stage 1) to capture its true base measurements, then tilt the rigid elevation (Stage 2).',
        analogyHi: 'Tilted pyramid ko seedha nahi bana sakte—pehle use seedha khada banate hain (Stage 1) aur phir uske Front View ko required angle par jhuka dete hain (Stage 2).',
        typicalQuestion: 'A pentagonal pyramid, base 30 mm side and axis 60 mm long, rests on one of its base edges on HP with its axis inclined at 45° to HP. Draw its Front View and Top View.',
        standardMarks: 7,
        rubricHighlight: '2.5M for Stage 1 true pentagon with right-hand vertical edge + 2.5M for Stage 2 tilted elevation + 2M for visible vs hidden dashed edges.',
        problemStatement: 'State the rule for orienting the Stage-1 base when a solid rests on a base edge vs a base corner on HP.',
        steps: [
          {
            title: 'Golden Rule for Stage-1 Base Orientation',
            content: 'Always orient the resting element on the RIGHT-HAND side in Stage 1:',
            codeSnippet: `1. Axis inclined to HP -> Start Stage 1 in TOP VIEW (below XY) showing true base shape.\n2. Axis inclined to VP -> Start Stage 1 in FRONT VIEW (above XY) showing true base shape.\n3. Resting on BASE EDGE -> Place that edge PERPENDICULAR to XY on the right side.\n4. Resting on CORNER    -> Place that corner on the extreme RIGHT side.`,
          },
        ],
        mistakes: [
          { mistake: 'Drawing hidden inner edges as solid continuous lines instead of dashed lines', penalty: '-2 Marks', remedy: 'Any edge hidden behind the visible face from the observer’s line of sight must be drawn as a dashed line (---).' },
        ],
        mcqQuestion: 'To draw the projections of a Pentagonal Prism whose axis is inclined at 40° to HP and parallel to VP, in which view should Stage 1 (True Shape of Base) be drawn first?',
        mcqOptions: ['Front View (above XY)', 'Top View (below XY)', 'Side View', 'Isometric View'],
        mcqAnswerIndex: 1,
        mcqExplanation: 'When the axis is inclined to HP, assume the axis perpendicular to HP in Stage 1, so the Top View shows the true pentagon base.',
        pyqYear: 2023,
        pyqSeason: 'Nov/Dec',
        pyqQNum: 'Q.3(a)',
      },
    ],
  },
  {
    number: 4,
    title: 'Sections of Solids & Development of Lateral Surfaces',
    description: 'True shape of section cut by Auxiliary Inclined Plane (AIP), Parallel-line development (Prisms/Cylinders) & Radial-line development (Pyramids/Cones).',
    weightMarks: 13,
    topics: [
      {
        title: 'Section Planes (AIP) & Development of Surfaces (Parallel vs Radial Line)',
        weight: 86,
        freq: 88,
        appearances: 5,
        marks5Yr: 35,
        difficulty: 68,
        difficultyLabel: 'Moderate',
        defEn: 'A Section Plane (Cutting Plane) cuts a solid to reveal internal details; the cut surface is cross-hatched with thin 45° lines spaced 2–3 mm apart. Development of Surfaces unfolds the complete lateral surface of a 3D solid onto a flat 2D sheet for sheet-metal fabrication: Prisms and Cylinders use Parallel-Line Development (length = perimeter / πD), whereas Pyramids and Cones use Radial-Line Development (sector angle θ = (r / L) × 360°).',
        defHi: 'Section plane kisi solid ko kaat kar usका True Shape dikhata hai jise 45° thin lines se hatch karte hain. Development of Surfaces mein 3D solid ko 2D sheet par khola jata hai: Prism/Cylinder ke liye Parallel-Line method aur Cone/Pyramid ke liye Radial-Line method (θ = (r / L) × 360°) use hota hai.',
        analogyTitle: 'Unfolding a Cardboard Gift Box or Ice-Cream Cone Wrapper',
        analogyEn: 'Unfolding a toothpaste box gives rectangular parallel strips (Parallel-line method), while unwrapping a paper ice-cream cone gives a fan-shaped circular sector (Radial-line method).',
        analogyHi: 'Cardboard box ko kholne par parallel rectangles bante hain, aur cone ko kholne par θ = (r/L)×360° ka fan sector banta hai.',
        typicalQuestion: 'A right circular cone of base diameter 50 mm and height 60 mm rests on its base on HP. An AIP inclined at 45° to HP bisects the axis. Draw its sectional top view, true shape of section, and development of the truncated lateral surface.',
        standardMarks: 10,
        rubricHighlight: '3M for sectional top view with 45° hatching + 3M for True Shape on auxiliary plane + 4M for Radial-Line development sector.',
        problemStatement: 'Calculate the true slant generator length L and subtended sector angle θ for developing a cone of base diameter D = 50 mm and axis height h = 60 mm.',
        steps: [
          {
            title: 'Calculate Slant Length L and Sector Angle θ',
            content: 'Use Pythagoras theorem for true slant length L and θ = (r / L) × 360°:',
            codeSnippet: `Base radius r = D / 2 = 25 mm,  Axis height h = 60 mm\nTrue Slant Generator L = √(r² + h²) = √(25² + 60²) = √(625 + 3600) = 65 mm\nSubtended Sector Angle θ = (r / L) × 360° = (25 / 65) × 360° = 138.46°`,
          },
        ],
        mistakes: [
          { mistake: 'Using apparent slant edge instead of TRUE slant length L when drawing radial development', penalty: '-2.5 Marks', remedy: 'Development of surfaces always requires True Lengths of every edge and generator.' },
        ],
        mcqQuestion: 'Which method is used to develop the lateral surface of a Right Circular Cone and a Square Pyramid?',
        mcqOptions: ['Parallel-line method', 'Radial-line method', 'Triangulation method', 'Approximation zone method'],
        mcqAnswerIndex: 1,
        mcqExplanation: 'Cones and pyramids converge to a single apex, so their lateral surfaces unfold as radial sectors around the apex.',
        pyqYear: 2024,
        pyqSeason: 'May/June',
        pyqQNum: 'Q.4(b)',
      },
    ],
  },
  {
    number: 5,
    title: 'Isometric Projections & AutoCAD Commands',
    description: 'Isometric axes (120° apart), Isometric Scale (0.816 × True Length), Isometric view vs Isometric projection, and basic AutoCAD 2D/3D commands.',
    weightMarks: 12,
    topics: [
      {
        title: 'Isometric Scale vs Isometric View & Essential AutoCAD Commands',
        weight: 88,
        freq: 90,
        appearances: 5,
        marks5Yr: 35,
        difficulty: 55,
        difficultyLabel: 'Moderate',
        defEn: 'Isometric Projection is a 3D pictorial projection on a single plane where the three principal axes (X, Y, Z) are equally inclined to the plane of projection and make 120° with each other (30° to the horizontal line). Because edges foreshorten by cos(35°16\') / cos(30°) = √(2/3) ≈ 0.8165, an Isometric Projection uses Isometric Scale (81.6% of True Length), whereas an Isometric View/Drawing uses 100% True Length directly.',
        defHi: 'Isometric Projection mein teeno principal axes ek dusre se 120° par (horizontal se 30° par) hoti hain. Isometric Projection banate samay Isometric Scale (0.816 × True Length) use hota hai, jabki Isometric View/Drawing mein seedha 100% True Length use karte hain.',
        analogyTitle: 'Isometric Projection (81.6% Scaled) vs Isometric View (100% True)',
        analogyEn: 'Think of Isometric View as drawing with your regular ruler (100% length), and Isometric Projection as drawing with a specially shrunk ruler (81.6% length) to account for 3D foreshortening.',
        analogyHi: 'Isometric View mein normal ruler (100% True Length) use karte hain, aur Isometric Projection mein 0.816 factor wala Isometric Scale use karte hain.',
        typicalQuestion: 'Differentiate between Isometric View and Isometric Projection. Construct an Isometric Scale and explain 8 essential AutoCAD drawing and editing commands (LINE, CIRCLE, OFFSET, TRIM, EXTEND, ARRAY, MIRROR, LAYER).',
        standardMarks: 7,
        rubricHighlight: '2.5M for 45°/30° Isometric Scale construction + 2M for Isometric View vs Projection table + 2.5M for AutoCAD commands syntax.',
        problemStatement: 'Derive the Isometric foreshortening factor √(2/3) ≈ 0.816 and list the main AutoCAD modify commands.',
        steps: [
          {
            title: 'Isometric Scale Ratio & Construction (45° and 30° Lines)',
            content: 'Draw a base line, mark 45° for True Length and 30° for Isometric Length, and drop vertical projectors:',
            codeSnippet: `Isometric Length / True Length = cos(45°) / cos(30°) = (1/√2) / (√3/2) = √(2/3) ≈ 0.8165\n• Circle in Orthographic View ---> Appears as an ELLIPSE (Four-Center Method) in Isometric.`,
          },
          {
            title: 'Key AutoCAD Commands for RGPV Theory Questions',
            content: 'Include command name, shortcut, and exact purpose:',
            codeSnippet: `1. OFFSET (O): Creates concentric circles or parallel lines at a specified distance.\n2. TRIM (TR):   Cuts objects where they intersect with a cutting edge.\n3. ARRAY (AR):  Creates Rectangular or Polar copies of objects in a pattern.\n4. LAYER (LA):  Organizes centerlines, hidden lines, dimensions, and object outlines by color/linetype.`,
          },
        ],
        mistakes: [
          { mistake: 'Drawing true lengths when the question specifically asks for "Isometric Projection" instead of "Isometric View"', penalty: '-2.5 Marks', remedy: 'If the question says "Isometric Projection", you MUST first construct the Isometric Scale (0.816×TL) on the sheet.' },
        ],
        mcqQuestion: 'What is the ratio of Isometric Length to True Length on an Isometric Scale?',
        mcqOptions: ['1.000', '√(2/3) ≈ 0.816', '√3 / 2 ≈ 0.866', '1 / √2 ≈ 0.707'],
        mcqAnswerIndex: 1,
        mcqExplanation: 'Isometric length / True length = cos 45° / cos 30° = √(2/3) ≈ 0.8165.',
        pyqYear: 2024,
        pyqSeason: 'May/June',
        pyqQNum: 'Q.5(a)',
      },
    ],
  },
];

// ============================================================================
// 2ND SEMESTER & HIGHER SEMESTER CORE SUBJECT BLUEPRINTS
// ============================================================================

interface QuickSubjectBlueprint {
  units: Array<{
    title: string;
    desc: string;
    t1Title: string;
    t1DefEn: string;
    t1DefHi: string;
    t1Q: string;
    t1Code: string;
    t2Title: string;
    t2DefEn: string;
    t2DefHi: string;
    t2Q: string;
    t2Code: string;
  }>;
}

const SUBJECT_BLUEPRINTS: Record<string, QuickSubjectBlueprint> = {
  'BT-201': {
    units: [
      {
        title: 'Quantum Mechanics & Schrödinger Wave Equation',
        desc: 'De-Broglie matter waves, Heisenberg Uncertainty Principle, Time-independent Schrödinger wave equation, and Particle in a 1D Potential Box.',
        t1Title: 'Schrödinger Wave Equation & Particle in a 1D Infinite Potential Box',
        t1DefEn: 'Matter waves associated with a moving particle of momentum p have De-Broglie wavelength λ = h/p. The time-independent Schrödinger equation is ∇²ψ + (2m/ℏ²)(E - V)ψ = 0. For a particle trapped in a 1D box of length L (V = 0 inside, V = ∞ outside), normalized wavefunctions are ψ_n(x) = √(2/L) sin(nπx/L) and quantized energy levels are E_n = (n²h²) / (8mL²).',
        t1DefHi: 'De-Broglie wavelength λ = h/p hoti hai. 1D potential box (length L) mein trapped particle ke liye Schrödinger equation solve karne par wavefunction ψ_n(x) = √(2/L) sin(nπx/L) aur quantized energy E_n = (n²h²) / (8mL²) milti hai.',
        t1Q: 'Derive the Time-Independent Schrödinger Wave Equation and apply it to find the eigenvalues (E_n) and normalized eigenfunctions (ψ_n) for a particle in a 1D infinite potential box.',
        t1Code: `d²ψ/dx² + (2mE / ℏ²)ψ = 0  (inside box 0 < x < L where V = 0)\nBoundary Conditions: ψ(0) = 0 and ψ(L) = 0  ==>  k·L = nπ\nNormalized Wavefunction: ψ_n(x) = √(2/L) sin(nπx / L)\nQuantized Energy Levels: E_n = (n² h²) / (8 m L²),  n = 1, 2, 3...`,
        t2Title: 'Heisenberg Uncertainty Principle & Compton Effect',
        t2DefEn: 'Heisenberg’s Uncertainty Principle states that it is impossible to simultaneously measure both position (x) and canonically conjugate momentum (p_x) of a microscopic particle with absolute precision: Δx · Δp_x ≥ ℏ/2. This proves why free electrons cannot exist inside an atomic nucleus.',
        t2DefHi: 'Heisenberg Uncertainty Principle ke anusar kisi microscopic particle ki position (Δx) aur momentum (Δp_x) ko ek sath exact measure nahi kiya ja sakta: Δx · Δp_x ≥ ℏ/2. Isi se prove hota hai ki electron nucleus ke andar exist nahi kar sakta.',
        t2Q: 'State Heisenberg’s Uncertainty Principle and apply it to prove that free electrons cannot exist inside the atomic nucleus.',
        t2Code: `Δx · Δp_x ≥ h / (4π)\nFor nuclear radius r ≈ 5×10⁻¹⁵ m => Δx = 2r = 10⁻¹⁴ m\nCalculated minimum electron energy E ≈ 20 MeV >> observed β-decay energy (4 MeV).`,
      },
      {
        title: 'Wave Optics: Interference in Thin Films & Diffraction Grating',
        desc: 'Newton’s Rings, Michelson Interferometer, Fraunhofer single-slit & N-slit plane transmission diffraction grating, and Rayleigh’s criterion.',
        t1Title: 'Newton’s Rings Experiment & Wavelength / Refractive Index Formula',
        t1DefEn: 'When a plano-convex lens of large radius of curvature R rests on a flat glass plate, a wedge-shaped air film of variable thickness t is formed. Monochromatic light incident normally produces concentric circular dark and bright interference fringes (Newton’s Rings) with a dark central spot due to π phase change upon reflection from the denser bottom plate.',
        t1DefHi: 'Jab ek plano-convex lens ko flat glass plate par rakhte hain, toh beech ki air film se concentric dark aur bright circular rings (Newton’s Rings) banti hain. Niche wali denser plate se reflection par π phase shift ke karan center ring dark hoti hai.',
        t1Q: 'Explain the formation of Newton’s Rings with ray diagram. Prove that the diameters of dark rings are proportional to the square roots of natural numbers, and derive λ = (D_{n+p}² - D_n²) / (4pR).',
        t1Code: `Path Difference in Air Film: 2μt cos r + λ/2 = nλ\nDiameter of nth Dark Ring:   D_n² = 4 n λ R / μ\nWavelength Formula:          λ = (D_{n+p}² - D_n²) / (4 p R)`,
        t2Title: 'Plane Transmission Diffraction Grating & Resolving Power',
        t2DefEn: 'A diffraction grating consists of N parallel equidistant slits of width e separated by opaque spaces of width d. The grating equation for principal maxima is (e + d) sin θ = nλ, and its dispersive power is dθ/dλ = n / [(e + d) cos θ].',
        t2DefHi: 'Diffraction grating mein N parallel slits hoti hain. Principal maxima ki condition (e + d) sin θ = nλ aur Resolving Power λ / dλ = n · N hoti hai.',
        t2Q: 'Derive the intensity distribution and condition for principal maxima (e + d) sin θ = nλ in a Plane Transmission Diffraction Grating.',
        t2Code: `Grating Element: (e + d) = 1 / N (cm)\nPrincipal Maxima: (e + d) sin θ = n λ\nResolving Power:  R = λ / dλ = n × N (Order × Total ruled lines)`,
      },
      {
        title: 'Solid State Physics, Kronig-Penney Model & Hall Effect',
        desc: 'Energy bands in solids, Kronig-Penney model, Fermi-Dirac distribution, Intrinsic/Extrinsic semiconductors, and Hall Effect.',
        t1Title: 'Kronig-Penney Model, Energy Bands & Hall Effect Derivation',
        t1DefEn: 'The Kronig-Penney model represents the periodic crystal potential as a 1D array of rectangular potential wells and barriers, leading to the equation P (sin αa)/(αa) + cos αa = cos ka, which explains allowed Energy Bands and Forbidden Band Gaps (E_g). The Hall Effect generates a transverse voltage V_H when a current-carrying semiconductor is placed in a perpendicular magnetic field B_z.',
        t1DefHi: 'Kronig-Penney model crystal ke periodic potential se Allowed Energy Bands aur Forbidden Band Gap (E_g) ko samjhata hai. Hall Effect mein current-carrying semiconductor ko magnetic field mein rakhne par transverse Hall Voltage V_H aur Hall Coefficient R_H = -1/(ne) milta hai.',
        t1Q: 'Discuss the Kronig-Penney model for the motion of an electron in a periodic potential and show how it leads to energy bands in solids. Also derive the Hall Coefficient R_H.',
        t1Code: `Kronig-Penney Eq: P · [sin(αa) / (αa)] + cos(αa) = cos(ka)\nHall Coefficient: R_H = E_y / (J_x · B_z) = 1 / (p · e) [p-type] or -1 / (n · e) [n-type]\nHall Mobility:    μ_H = σ · |R_H|`,
        t2Title: 'Fermi Level in Intrinsic & Extrinsic Semiconductors',
        t2DefEn: 'In an intrinsic semiconductor at T = 0 K, the Fermi energy level E_F lies exactly midway between the Valence Band (E_V) and Conduction Band (E_C): E_F = (E_C + E_V)/2. Adding pentavalent donor impurities (n-type) shifts E_F upward near E_C, while trivalent acceptor impurities (p-type) shift E_F downward near E_V.',
        t2DefHi: 'Intrinsic semiconductor mein Fermi level E_F Conduction band (E_C) aur Valence band (E_V) ke bilkul beech mein hota hai. n-type doping mein E_F upar E_C ke paas aur p-type mein niche E_V ke paas shift ho jata hai.',
        t2Q: 'Show with energy band diagrams how the Fermi level E_F varies with temperature and doping in Intrinsic, n-type, and p-type semiconductors.',
        t2Code: `Intrinsic Fermi Level: E_F = (E_C + E_V)/2 + (3/4) kT ln(m_h* / m_e*)\nAt T = 0 K:            E_F = (E_C + E_V) / 2`,
      },
      {
        title: 'Lasers & Optical Fiber Communication',
        desc: 'Spontaneous vs Stimulated emission, Einstein A & B coefficients, Population inversion, Ruby & He-Ne Lasers, Acceptance Angle & Numerical Aperture.',
        t1Title: 'He-Ne Laser, Einstein’s Coefficients & Optical Fiber Numerical Aperture',
        t1DefEn: 'LASER operates on Stimulated Emission and Population Inversion (N₂ > N₁) achieved by optical/electrical pumping. A He-Ne Laser is a 4-level continuous-wave gas laser (10:1 mixture of He and Ne) emitting coherent 6328 Å red light. In an Optical Fiber, Numerical Aperture NA = √(n₁² - n₂²) = n₁√(2Δ) measures light-gathering capacity.',
        t1DefHi: 'Laser Stimulated Emission aur Population Inversion (N₂ > N₁) par kaam karta hai. He-Ne Laser ek 4-level continuous gas laser hai jo 6328 Å ki coherent red beam deta hai. Optical fiber ka Numerical Aperture NA = √(n₁² - n₂²) aur Acceptance Angle θ_a = sin⁻¹(NA) hota hai.',
        t1Q: 'Explain the construction and energy level diagram of a He-Ne Laser. Also derive the expressions for Acceptance Angle and Numerical Aperture (NA = √(n₁² - n₂²)) of an optical fiber.',
        t1Code: `Einstein Ratio:      A₂₁ / B₂₁ = 8 π h ν³ / c³\nNumerical Aperture:  NA = sin(θ_max) = √(n₁² - n₂²) = n₁ √(2Δ)\nFractional Index Δ:  Δ = (n₁ - n₂) / n₁`,
        t2Title: 'Ruby Laser (3-Level Solid State) vs Nd:YAG / CO2 Laser',
        t2DefEn: 'Ruby Laser is a 3-level pulsed solid-state laser using an Al2O3 crystal doped with 0.05% Cr³⁺ ions pumped by a helical Xenon flash lamp at 5500 Å, emitting a pulsed deep-red laser beam of wavelength 6943 Å.',
        t2DefHi: 'Ruby Laser ek 3-level pulsed solid-state laser hai jisme Al2O3 + Cr³⁺ rod aur Xenon flash tube use hoti hai, aur isse 6943 Å ki pulsed red beam milti hai.',
        t2Q: 'Describe the construction, working, and 3-level energy diagram of a Ruby Laser. Why is its output pulsed rather than continuous?',
        t2Code: `Ruby Rod: Al2O3 doped with 0.05% Cr³⁺ ions\nPumping:  Xenon Flash Lamp (5500 Å green light)\nOutput:   6943 Å Pulsed Red Laser Beam from metastable state E₂ -> E₁`,
      },
      {
        title: 'Electrostatics, Magnetostatics & Maxwell’s Equations',
        desc: 'Gradient, Divergence & Curl, Gauss’s Divergence & Stokes’ Theorems, Continuity equation, Displacement current, and Maxwell’s 4 equations.',
        t1Title: 'Maxwell’s Four Electromagnetic Equations (Differential & Integral Forms)',
        t1DefEn: 'Maxwell unified electricity, magnetism, and optics through four fundamental field equations: (1) Gauss’s Law for Electricity (∇·D = ρ_v), (2) Gauss’s Law for Magnetism (∇·B = 0, no magnetic monopoles), (3) Faraday’s Law of Electromagnetic Induction (∇×E = -∂B/∂t), and (4) Ampere-Maxwell Law incorporating Displacement Current J_d = ∂D/∂t (∇×H = J + ∂D/∂t).',
        t1DefHi: 'Maxwell ki 4 equations electricity aur magnetism ko jodti hain: (1) ∇·D = ρ_v, (2) ∇·B = 0, (3) ∇×E = -∂B/∂t, aur (4) ∇×H = J + ∂D/∂t (jahan ∂D/∂t Displacement Current density hai).',
        t1Q: 'Write Maxwell’s four electromagnetic equations in both Differential (Point) and Integral forms. Explain the concept of Displacement Current and derive the 4th equation.',
        t1Code: `1. Gauss Electric Law:   ∇ · D = ρ_v            |  ∮ D · dS = Q_enc\n2. Gauss Magnetic Law:   ∇ · B = 0              |  ∮ B · dS = 0\n3. Faraday's Law:        ∇ × E = -∂B/∂t         |  ∮ E · dl = -∫ (∂B/∂t)·dS\n4. Ampere-Maxwell Law:   ∇ × H = J + ∂D/∂t      |  ∮ H · dl = ∫ (J + ∂D/∂t)·dS`,
        t2Title: 'Electromagnetic Wave Equation in Free Space & Poynting Theorem',
        t2DefEn: 'In free space (ρ = 0, J = 0), Maxwell’s equations yield the 3D wave equation ∇²E = μ₀ε₀ (∂²E/∂t²), showing that electromagnetic waves propagate at speed c = 1 / √(μ₀ε₀) = 3 × 10⁸ m/s. The Poynting Vector S = E × H gives instantaneous electromagnetic power flow per unit area.',
        t2DefHi: 'Free space mein Maxwell equations se wave equation ∇²E = μ₀ε₀ (∂²E/∂t²) aur light ki speed c = 1/√(μ₀ε₀) = 3×10⁸ m/s milti hai.',
        t2Q: 'Derive the Electromagnetic Wave Equation in free space from Maxwell’s equations and prove that EM waves travel at the speed of light c = 1 / √(μ₀ε₀).',
        t2Code: `Take curl of Faraday's Law: ∇ × (∇ × E) = -μ₀ ∂(∇ × H)/∂t\nUsing ∇ · E = 0 and ∇ × H = ε₀ ∂E/∂t:\n∇²E = μ₀ ε₀ (∂²E / ∂t²)  ==>  Wave Velocity c = 1 / √(μ₀ ε₀) = 3 × 10⁸ m/s`,
      },
    ],
  },

  'CS-303': {
    units: [
      {
        title: 'Arrays, Time/Space Complexity & Asymptotic Notations',
        desc: 'Big-O, Omega, Theta notations, Row-major & Column-major address calculation, and Sparse Matrix representations.',
        t1Title: 'Asymptotic Notations (O, Ω, Θ) & 2D Array Address Calculation',
        t1DefEn: 'Asymptotic notations characterize algorithm growth rates as input size n → ∞: Big-O gives the tight upper bound f(n) ≤ c·g(n), Big-Omega (Ω) gives the lower bound f(n) ≥ c·g(n), and Theta (Θ) bounds both above and below. In a 2D array A[m][n] with base address B and element size w bytes, Row-Major address is Loc(A[i][j]) = B + w × [ (i - L_r)·n + (j - L_c) ].',
        t1DefHi: 'Big-O worst-case upper bound, Omega (Ω) best-case lower bound, aur Theta (Θ) average tight bound batata hai. 2D array mein Row-Major address Loc(A[i][j]) = Base + w × [ (i - L_r)×Cols + (j - L_c) ] formula se nikalte hain.',
        t1Q: 'Define Big-O, Big-Omega (Ω), and Theta (Θ) notations with graphs. Also derive the Row-Major and Column-Major address formulas for a 2D array A[10..50, 20..60] stored at base address 1000 with word size 4 bytes.',
        t1Code: `Row-Major Address:    Loc(A[i][j]) = Base + w × [ (i - L_r) × N_cols + (j - L_c) ]\nColumn-Major Address: Loc(A[i][j]) = Base + w × [ (j - L_c) × N_rows + (i - L_r) ]`,
        t2Title: 'Singly, Doubly & Circular Linked List Operations',
        t2DefEn: 'A Linked List is a dynamic linear data structure of nodes connected via pointers. A Doubly Linked List (DLL) maintains both prev and next pointers, allowing O(1) bidirectional traversal and deletion when given a node pointer.',
        t2DefHi: 'Linked List dynamic nodes ki chain hai. Doubly Linked List (DLL) mein har node ke paas prev aur next dono pointers hote hain jisse forward aur backward dono direction mein traverse kar sakte hain.',
        t2Q: 'Write C/C++ algorithms to insert and delete a node at a given position in a Doubly Linked List with pointer manipulation diagrams.',
        t2Code: `// Delete node 'del' in Doubly Linked List:\nif (del->prev != NULL) del->prev->next = del->next;\nif (del->next != NULL) del->next->prev = del->prev;\nfree(del);`,
      },
      {
        title: 'Stacks, Queues, Infix-to-Postfix & Recursion',
        desc: 'LIFO Stack operations, Infix to Postfix conversion & evaluation, Tower of Hanoi recursion, and Circular/Priority Queues.',
        t1Title: 'Stack Infix-to-Postfix Conversion & Postfix Evaluation Algorithm',
        t1DefEn: 'A Stack (LIFO) converts an Infix expression (A + B * C) into parenthesized-free Postfix / Reverse Polish Notation (A B C * +) using operator precedence (^ > *,/ > +,-) and associativity rules, enabling single-pass left-to-right compiler evaluation in O(n) time.',
        t1DefHi: 'Stack (Last-In First-Out) ki madad se Infix expression ko Postfix (Reverse Polish Notation) mein convert kiya jata hai. Operator precedence (^ > *,/ > +,-) ke hisab se stack push/pop table banai jati hai.',
        t1Q: 'Write the algorithm to convert an Infix expression into Postfix using a Stack. Trace the step-by-step stack contents for: A + (B * C - (D / E ^ F) * G) * H.',
        t1Code: `Symbol | Stack Contents     | Postfix Output\n-------+--------------------+-------------------------\nA      |                    | A\n+      | +                  | A\n(      | + (                | A\nB * C  | + ( *              | A B C\n-      | + ( -              | A B C *\n...    | Final Empty        | A B C * D E F ^ / G * - H * +`,
        t2Title: 'Circular Queue vs Deque & Overflow/Underflow Conditions',
        t2DefEn: 'A Circular Queue overcomes the false-overflow wastage of a linear array queue by wrapping indices modulo capacity N: rear = (rear + 1) % N. It is full when (rear + 1) % N == front and empty when front == -1.',
        t2DefHi: 'Linear queue mein front aage badhne par khali jagah waste hoti hai. Circular Queue mein rear = (rear + 1) % N formula se array wrap-around ho jata hai.',
        t2Q: 'Why is a Circular Queue preferred over a Linear Queue? Write C functions for Enqueue and Dequeue in a Circular Queue showing Full and Empty conditions.',
        t2Code: `// Circular Queue Full Condition:\nif ((rear + 1) % MAX == front) printf("Queue Overflow");\n// Advance Rear Circularly:\nrear = (rear + 1) % MAX;\nqueue[rear] = item;`,
      },
      {
        title: 'Trees: Binary Search Trees (BST), AVL Trees & B-Trees',
        desc: 'Preorder/Inorder/Postorder traversals, BST insertion/deletion, Height-balanced AVL rotations (LL, RR, LR, RL), and Threaded Binary Trees.',
        t1Title: 'AVL Tree Balancing Factor & LL, RR, LR, RL Rotations',
        t1DefEn: 'An AVL Tree is a self-balancing Binary Search Tree where the Balance Factor BF = Height(Left Subtree) - Height(Right Subtree) of every node belongs strictly to {-1, 0, +1}. When an insertion causes |BF| = 2, height balance is restored in O(1) time via Single Rotations (LL or RR) or Double Rotations (LR or RL), guaranteeing O(log n) search, insert, and delete.',
        t1DefHi: 'AVL Tree ek self-balancing BST hai jiske har node ka Balance Factor BF = H(Left) - H(Right) hamesha -1, 0, ya +1 hota hai. Agar |BF| = 2 ho jaye toh LL, RR, LR, ya RL rotation lagakar tree ko balance karte hain.',
        t1Q: 'Construct an AVL Tree by inserting the keys: 21, 26, 30, 9, 4, 14, 28, 18, 15, 10, 2, 3, 7 step-by-step, clearly showing Balance Factors and LL/RR/LR/RL rotations.',
        t1Code: `Balance Factor (BF) = Height(Left) - Height(Right) ∈ {-1, 0, +1}\n• Left-Left (LL) Imbalance   --> Single Right Rotation\n• Right-Right (RR) Imbalance --> Single Left Rotation\n• Left-Right (LR) Imbalance  --> Left Rotate Child, then Right Rotate Root`,
        t2Title: 'Binary Tree Construction from Inorder and Preorder Traversals',
        t2DefEn: 'In Preorder (Root-Left-Right), the first element is always the root of the subtree; locating that root in the Inorder (Left-Root-Right) sequence partitions the remaining nodes into Left and Right subtrees recursively.',
        t2DefHi: 'Preorder ka pehla element Root hota hai, aur use Inorder mein dhoondh kar Left aur Right subtrees ko recursively alag-alag bana lete hain.',
        t2Q: 'Construct the unique Binary Tree from Inorder: D B E A F C G and Preorder: A B D E C F G, and write its Postorder traversal.',
        t2Code: `Preorder: [A] B D E C F G  ==> Root is A\nInorder:  [D B E] (A) [F C G] ==> Left: {D,B,E}, Right: {F,C,G}\nResulting Postorder (Left-Right-Root): D E B F G C A`,
      },
      {
        title: 'Graphs: BFS, DFS, Dijkstra’s Shortest Path & Minimum Spanning Tree',
        desc: 'Adjacency Matrix vs List, Breadth-First Search (BFS), Depth-First Search (DFS), Prim’s & Kruskal’s MST, and Dijkstra’s algorithm.',
        t1Title: 'Prim’s & Kruskal’s Minimum Spanning Tree (MST) and Dijkstra’s Algorithm',
        t1DefEn: 'A Minimum Spanning Tree (MST) of a connected weighted undirected graph G(V, E) is an acyclic subgraph connecting all |V| vertices with |V| - 1 edges and minimum total edge weight. Kruskal’s algorithm sorts edges by weight and adds non-cycle edges using Union-Find in O(E log E), while Prim’s grows a single tree from a start vertex in O(E log V).',
        t1DefHi: 'Minimum Spanning Tree (MST) graph ke saare V vertices ko (V - 1) edges se bina cycle banaye minimum total weight mein jodta hai. Kruskal’s edge-based greedy method hai aur Prim’s vertex-based method hai.',
        t1Q: 'Differentiate between Prim’s and Kruskal’s algorithms for finding Minimum Spanning Tree (MST) with a worked weighted graph example. Also trace Dijkstra’s single-source shortest path algorithm.',
        t1Code: `Dijkstra Relaxation Step for edge (u, v) with weight w(u,v):\nif (dist[u] + w(u, v) < dist[v]) {\n    dist[v] = dist[u] + w(u, v);\n    parent[v] = u;\n}`,
        t2Title: 'BFS (Queue) vs DFS (Stack) Graph Traversal',
        t2DefEn: 'Breadth-First Search (BFS) explores a graph level-by-level using a FIFO Queue and finds shortest paths in unweighted graphs, while Depth-First Search (DFS) plunges down each branch using a LIFO Stack (or recursion) and detects cycles and topological ordering.',
        t2DefHi: 'BFS Queue (FIFO) use karke level-by-level traverse karta hai, jabki DFS Stack (LIFO) use karke depth mein traverse karta hai.',
        t2Q: 'Compare Breadth-First Search (BFS) and Depth-First Search (DFS) graph traversals across data structure used, time complexity, and applications.',
        t2Code: `BFS: Uses Queue (FIFO) | Time: O(V + E) | Shortest path in unweighted graph\nDFS: Uses Stack (LIFO) | Time: O(V + E) | Cycle detection, Topological sort`,
      },
      {
        title: 'Sorting & Searching: Quick Sort, Merge Sort, Heap Sort & Hashing',
        desc: 'Binary Search, Quick Sort, Merge Sort, Max-Heap Sort, Hash tables, and Collision resolution (Chaining vs Open Addressing).',
        t1Title: 'Quick Sort, Merge Sort, Heap Sort Complexity & Hash Collision Resolution',
        t1DefEn: 'Quick Sort partitions an array around a pivot in O(n log n) average time (O(n²) worst case, O(log n) in-place stack space). Merge Sort divides and merges halves in guaranteed O(n log n) time using O(n) auxiliary space. Hashing maps keys to table indices in O(1) average time using h(k) = k mod m, resolving collisions via Chaining or Open Addressing (Linear/Quadratic Probing, Double Hashing).',
        t1DefHi: 'Quick Sort pivot partition se O(n log n) average time लेता hai. Merge Sort har case mein O(n log n) deta hai. Hashing mein h(k) = k mod m se O(1) search milta hai aur collision ko Linear/Quadratic Probing ya Chaining se resolve karte hain.',
        t1Q: 'Trace Quick Sort and Merge Sort on the array: [45, 22, 89, 11, 67, 34, 50, 19]. Also insert keys [23, 43, 13, 27, 33] into a hash table of size m = 10 using Linear Probing and Quadratic Probing.',
        t1Code: `Linear Probing:    h(k, i) = [ (k mod m) + i ] mod m         (i = 0, 1, 2...)\nQuadratic Probing: h(k, i) = [ (k mod m) + i² ] mod m        (prevents primary clustering)\nDouble Hashing:    h(k, i) = [ h₁(k) + i · h₂(k) ] mod m`,
        t2Title: 'Heap Sort & Max-Heapify Construction',
        t2DefEn: 'A Binary Max-Heap is a complete binary tree stored in an array where every parent A[i] ≥ children A[2i+1] and A[2i+2]. Building a heap takes O(n) time and extracting the maximum n times sorts in-place in O(n log n) worst-case time.',
        t2DefHi: 'Max-Heap ek complete binary tree hai jisme parent hamesha apne children se bada hota hai. Heap Sort O(n log n) worst-case time aur O(1) extra space mein sort karta hai.',
        t2Q: 'Explain the Heap Sort algorithm and build a Max-Heap step-by-step for the array: [12, 11, 13, 5, 6, 7].',
        t2Code: `Left Child(i)  = 2*i + 1\nRight Child(i) = 2*i + 2\nParent(i)      = (i - 1) / 2\nTime Complexity: Build-Max-Heap = O(n), Total Heap Sort = O(n log n)`,
      },
    ],
  },
};

function generateDynamicCurriculumForSubject(
  subjectCode: string,
  subjectName: string
): { units: Unit[]; pyqs: PYQQuestion[] } {
  const codeUpper = (subjectCode || '').trim().toUpperCase();
  const nameLower = (subjectName || '').toLowerCase();

  // 1. Check if DBMS (CS-502, AL-502, CD-304)
  if (
    codeUpper === 'CS-502' ||
    codeUpper === 'AL-502' ||
    codeUpper === 'CD-304' ||
    nameLower.includes('database management')
  ) {
    return { units: dbmsUnits, pyqs: dbmsPyqs };
  }

  // 2. Check exact 1st Semester Seeds (BT-101 to BT-105)
  if (codeUpper === 'BT-101' || nameLower.includes('chemistry')) {
    return buildCurriculumFromSeeds(subjectCode || 'BT-101', subjectName || 'Engineering Chemistry', BT_101_SEEDS);
  }
  if (codeUpper === 'BT-102' || nameLower === 'mathematics-i') {
    return buildCurriculumFromSeeds(subjectCode || 'BT-102', subjectName || 'Mathematics-I', BT_102_SEEDS);
  }
  if (codeUpper === 'BT-103' || nameLower.includes('english') || nameLower.includes('communication')) {
    if (!nameLower.includes('analog') && !nameLower.includes('digital') && !nameLower.includes('mobile') && !nameLower.includes('optical') && !nameLower.includes('satellite') && !nameLower.includes('data communication')) {
      return buildCurriculumFromSeeds(subjectCode || 'BT-103', subjectName || 'English for Communication', BT_103_SEEDS);
    }
  }
  if (codeUpper === 'BT-104' || nameLower.includes('basic electrical')) {
    return buildCurriculumFromSeeds(subjectCode || 'BT-104', subjectName || 'Basic Electrical & Electronics Engineering', BT_104_SEEDS);
  }
  if (codeUpper === 'BT-105' || nameLower.includes('engineering graphics')) {
    return buildCurriculumFromSeeds(subjectCode || 'BT-105', subjectName || 'Engineering Graphics', BT_105_SEEDS);
  }

  // 3. Check Quick Blueprints (BT-201 Physics, CS-303/AL-303/CD-303 Data Structures)
  if (codeUpper === 'BT-201' || nameLower.includes('physics')) {
    return convertQuickBlueprintToCurriculum(subjectCode || 'BT-201', subjectName || 'Engineering Physics', SUBJECT_BLUEPRINTS['BT-201']);
  }
  if (codeUpper === 'CS-303' || codeUpper === 'AL-303' || codeUpper === 'CD-303' || nameLower.includes('data structure')) {
    return convertQuickBlueprintToCurriculum(subjectCode || 'CS-303', subjectName || 'Data Structures', SUBJECT_BLUEPRINTS['CS-303']);
  }

  // 4. Subject-Specific Domain Generator for ALL Other RGPV Subjects (Semesters 2 to 8 across CSE, AIML, DS, ECE)
  return generateDomainSpecificSubjectCurriculum(
    subjectCode || 'RGPV-101',
    subjectName || 'University Engineering Course'
  );
}

function convertQuickBlueprintToCurriculum(
  subjectCode: string,
  subjectName: string,
  blueprint: QuickSubjectBlueprint
): { units: Unit[]; pyqs: PYQQuestion[] } {
  const seeds: UnitSeed[] = blueprint.units.map((u, idx) => ({
    number: idx + 1,
    title: u.title,
    description: u.desc,
    weightMarks: idx < 2 ? 16 : 14,
    topics: [
      {
        title: u.t1Title,
        weight: 94,
        freq: 95,
        appearances: 6,
        marks5Yr: 42,
        difficulty: 68,
        difficultyLabel: 'Moderate',
        defEn: u.t1DefEn,
        defHi: u.t1DefHi,
        analogyTitle: `Core Concept Analogy: ${u.t1Title}`,
        analogyEn: `In ${subjectName}, ${u.t1Title} acts as the structural foundation for solving 7- and 10-mark university problems.`,
        analogyHi: `${subjectName} mein ${u.t1Title} 7 aur 10 marks ke university numericals aur derivations ka main base hai.`,
        typicalQuestion: u.t1Q,
        standardMarks: 7,
        rubricHighlight: '2M for formal definition + 3M for labeled diagram & derivation + 2M for worked application.',
        problemStatement: u.t1Q,
        steps: [
          {
            title: 'Key Equations, Architecture & Derivation Steps',
            content: 'Include these exact formulas and structural points in your RGPV exam sheet:',
            codeSnippet: u.t1Code,
          },
        ],
        mistakes: [
          {
            mistake: `Skipping labeled block/circuit/ray diagrams when answering ${u.t1Title}`,
            penalty: '-2 Marks',
            remedy: 'Always draw a clean, labeled diagram and box the final formula.',
          },
        ],
        mcqQuestion: `Which of the following is the primary principle tested in ${u.t1Title} (${subjectCode})?`,
        mcqOptions: [
          u.t1Code.split('\n')[0] || u.t1Title,
          'Unrelated database normalization rule',
          'Zero-order approximation only',
          'None of the above',
        ],
        mcqAnswerIndex: 0,
        mcqExplanation: `The core relationship for ${u.t1Title} is ${u.t1Code.split('\n')[0]}.`,
        pyqYear: 2024,
        pyqSeason: 'May/June',
        pyqQNum: `Q.${idx + 1}(a)`,
      },
      {
        title: u.t2Title,
        weight: 86,
        freq: 88,
        appearances: 4,
        marks5Yr: 28,
        difficulty: 60,
        difficultyLabel: 'Moderate',
        defEn: u.t2DefEn,
        defHi: u.t2DefHi,
        analogyTitle: `Exam Application: ${u.t2Title}`,
        analogyEn: `Understanding ${u.t2Title} lets you compare edge cases and write crisp tabular differentiations in RGPV exams.`,
        analogyHi: `${u.t2Title} ko samajhne se aap exam mein comparison table aur numericals aasani se likh sakte hain.`,
        typicalQuestion: u.t2Q,
        standardMarks: 7,
        rubricHighlight: '2M for concept definition + 3M for mathematical/algorithmic steps + 2M for comparison table.',
        problemStatement: u.t2Q,
        steps: [
          {
            title: 'Core Formula & Step-by-Step Breakdown',
            content: 'Present these points clearly with subheadings:',
            codeSnippet: u.t2Code,
          },
        ],
        mistakes: [
          {
            mistake: 'Writing paragraphs without highlighting mathematical expressions or conditions',
            penalty: '-1.5 Marks',
            remedy: 'Underline key terms and enclose final results in a rectangular box.',
          },
        ],
        mcqQuestion: `In ${subjectCode} (${subjectName}), which relation holds for ${u.t2Title}?`,
        mcqOptions: [
          u.t2Code.split('\n')[0] || u.t2Title,
          'Constant zero output',
          'Infinite latency without bounds',
          'None of these',
        ],
        mcqAnswerIndex: 0,
        mcqExplanation: `As derived in ${u.t2Title}: ${u.t2Code.split('\n')[0]}.`,
        pyqYear: 2023,
        pyqSeason: 'Nov/Dec',
        pyqQNum: `Q.${idx + 1}(b)`,
      },
    ],
  }));

  return buildCurriculumFromSeeds(subjectCode, subjectName, seeds);
}

// Domain-specific unit map for all remaining RGPV subjects
const DOMAIN_UNIT_MAP: Array<{
  keywords: string[];
  units: Array<{ title: string; desc: string; t1: string; t2: string; formula1: string; formula2: string }>;
}> = [
  {
    keywords: ['mathematics-ii', 'bt-202'],
    units: [
      { title: 'Ordinary Differential Equations I', desc: 'Exact DE, Linear & Bernoulli forms, Higher-order linear DE with constant coefficients.', t1: 'Higher-Order Linear DE with Constant Coefficients (CF & PI)', t2: 'Method of Variation of Parameters', formula1: '(D² + aD + b)y = X  ==>  y = C.F. + P.I.', formula2: 'y_p = -y₁ ∫ (y₂ X / W) dx + y₂ ∫ (y₁ X / W) dx' },
      { title: 'Ordinary Differential Equations II (Series Solutions)', desc: 'Power series method, Bessel’s and Legendre’s differential equations and recurrence relations.', t1: 'Bessel’s Differential Equation & Recurrence Relations', t2: 'Legendre’s Polynomials P_n(x) & Rodrigues’ Formula', formula1: 'x² y\'\' + x y\' + (x² - n²)y = 0  ==>  J_n(x)', formula2: 'P_n(x) = [1 / (2^n n!)] · d^n/dx^n [ (x² - 1)^n ]' },
      { title: 'Partial Differential Equations (PDE)', desc: 'Lagrange’s linear PDE Pp + Qq = R, Charpit’s method, and Homogeneous PDE with constant coefficients.', t1: 'Lagrange’s Linear PDE (Pp + Qq = R) & Auxiliary Equations', t2: 'Homogeneous Linear PDE with Constant Coefficients', formula1: 'dx / P = dy / Q = dz / R', formula2: '(D² - a² D\'²)z = F(x, y)  ==>  z = C.F. + P.I.' },
      { title: 'Functions of Complex Variable', desc: 'Analytic functions, Cauchy-Riemann equations, Harmonic conjugates, Cauchy Integral & Residue Theorem.', t1: 'Analytic Functions & Cauchy-Riemann (C-R) Equations', t2: 'Cauchy’s Residue Theorem & Contour Integration', formula1: '∂u/∂x = ∂v/∂y  and  ∂u/∂y = -∂v/∂x (Cartesian C-R)', formula2: '∮_C f(z) dz = 2πi × Σ Residues inside C' },
      { title: 'Vector Calculus: Gradient, Divergence, Curl & Integral Theorems', desc: 'Directional derivative, Solenoidal/Irrotational fields, Green’s, Stokes’ and Gauss Divergence theorems.', t1: 'Directional Derivative, Solenoidal (∇·F = 0) & Irrotational (∇×F = 0) Fields', t2: 'Gauss Divergence Theorem & Stokes’ Theorem Verification', formula1: '∇φ = (∂φ/∂x)i + (∂φ/∂y)j + (∂φ/∂z)k', formula2: '∬_S F · n̂ dS = ∭_V (∇ · F) dV (Gauss Divergence)' },
    ],
  },
  {
    keywords: ['mechanical', 'bt-203'],
    units: [
      { title: 'Engineering Materials & Mechanical Properties', desc: 'Stress-strain curve for mild steel, Hooke’s law, Cast iron, Alloy steels, and Hardness testing.', t1: 'Stress-Strain Diagram for Ductile Mild Steel & Hooke’s Law', t2: 'Classification of Cast Iron, Carbon Steels & Mechanical Properties', formula1: 'Young\'s Modulus E = Stress (σ) / Strain (ε) = (P·L) / (A·δL)', formula2: 'Relationship: E = 2G(1 + μ) = 3K(1 - 2μ)' },
      { title: 'Measurement, Metrology & Production Engineering', desc: 'Vernier caliper, Micrometer, Sine bar, Lathe machine operations, Drilling, Welding & Casting.', t1: 'Vernier Caliper, Micrometer & Sine Bar Angle Measurement', t2: 'Lathe Machine Principle, Parts & Machining Operations', formula1: 'sin θ = Slip Gauge Height (h) / Sine Bar Length (L)', formula2: 'Least Count = 1 MSD - 1 VSD' },
      { title: 'Fluid Mechanics & Hydraulic Machines', desc: 'Newton’s law of viscosity, Bernoulli’s equation, Venturimeter, and Pelton/Francis/Kaplan turbines.', t1: 'Bernoulli’s Theorem Derivation & Venturimeter Discharge', t2: 'Impulse (Pelton Wheel) vs Reaction (Francis/Kaplan) Hydraulic Turbines', formula1: 'P/(ρg) + v²/(2g) + z = Constant (Total Head)', formula2: 'Shear Stress τ = μ · (du / dy)' },
      { title: 'Thermodynamics & Steam Engineering', desc: 'Zeroth, First & Second Laws of Thermodynamics, Cochran & Babcock-Wilcox Boilers, and Steam dryness fraction.', t1: 'First & Second Laws of Thermodynamics (Kelvin-Planck & Clausius)', t2: 'Fire-Tube (Cochran) vs Water-Tube (Babcock & Wilcox) Steam Boilers', formula1: 'δQ = dU + δW   and   COP_ref = T_L / (T_H - T_L)', formula2: 'Enthalpy of Wet Steam: h = h_f + x · h_fg' },
      { title: 'Reciprocating Internal Combustion (IC) Engines', desc: '2-Stroke vs 4-Stroke SI and CI engines, Otto cycle, Diesel cycle air-standard efficiency.', t1: '4-Stroke vs 2-Stroke Spark Ignition (Petrol) and CI (Diesel) Engines', t2: 'Air-Standard Efficiency of Otto Cycle and Diesel Cycle', formula1: 'Otto Efficiency: η_Otto = 1 - [ 1 / r^(γ - 1) ]', formula2: 'Diesel Efficiency: η_Diesel = 1 - [1 / r^(γ-1)] · [ (ρ^γ - 1) / γ(ρ - 1) ]' },
    ],
  },
  {
    keywords: ['civil', 'bt-204'],
    units: [
      { title: 'Building Materials & Construction Technology', desc: 'Bricks, Stones, Cement, Concrete (RCC), Mortar, Foundations, Doors, Windows & Stairs.', t1: 'Composition & Lab Tests of Portland Cement and First-Class Bricks', t2: 'Shallow vs Deep Foundations & RCC Building Elements', formula1: 'Water-Cement Ratio (Abrams Law) & Slump Cone Workability Test', formula2: 'Safe Bearing Capacity = Ultimate Bearing Capacity / Factor of Safety' },
      { title: 'Surveying & Levelling Instruments', desc: 'Chain & Compass surveying, Fore/Back bearings, Local attraction, and Dumpy Level (Height of Instrument vs Rise & Fall).', t1: 'Prismatic vs Surveyor’s Compass, Whole Circle Bearing & Local Attraction', t2: 'Differential Levelling: Height of Instrument (HI) vs Rise & Fall Method', formula1: 'Back Bearing (BB) = Fore Bearing (FB) ± 180°', formula2: 'Check: Σ B.S. - Σ F.S. = Σ Rise - Σ Fall = Last R.L. - First R.L.' },
      { title: 'Mapping, Sensing & Contouring', desc: 'Contour lines, Characteristics of contours, Planimeter area calculation, and Remote Sensing / GIS basics.', t1: 'Characteristics of Contour Lines & Uses of Contour Maps', t2: 'Introduction to Remote Sensing, EDM & Total Station Surveying', formula1: 'Simpson\'s One-Third Rule: Area = (d/3) [ (O₁ + O_n) + 4Σ(Even) + 2Σ(Odd) ]', formula2: 'Trapezoidal Rule: Area = d [ (O₁ + O_n)/2 + O₂ + O₃ + ... ]' },
      { title: 'Engineering Mechanics: Forces, Equilibrium & Trusses', desc: 'Law of Parallelogram of forces, Lami’s Theorem, Free-Body Diagrams, and Method of Joints/Sections for Trusses.', t1: 'Lami’s Theorem, Resolution of Concurrent Forces & Equilibrium Conditions', t2: 'Analysis of Perfect Plane Trusses by Method of Joints & Method of Sections', formula1: 'Lami\'s Theorem: P / sin α = Q / sin β = R / sin γ', formula2: 'Static Determinacy of Truss: m = 2j - 3 (where m = members, j = joints)' },
      { title: 'Centroid, Moment of Inertia & Shear Force / Bending Moment', desc: 'Parallel & Perpendicular Axis Theorems, Moment of inertia of I/T/L sections, and SFD/BMD for Simply Supported & Cantilever beams.', t1: 'Parallel & Perpendicular Axis Theorems and Centroid / MOI of Composite Sections', t2: 'Shear Force Diagram (SFD) & Bending Moment Diagram (BMD) for Beams', formula1: 'Parallel Axis Theorem: I_AB = I_G + A · h²   |   Perpendicular: I_zz = I_xx + I_yy', formula2: 'Relation: d(SF)/dx = -w (Load)   and   d(BM)/dx = SF (Point of Contraflexure: BM = 0)' },
    ],
  },
  {
    keywords: ['basic computer', 'bt-205'],
    units: [
      { title: 'Computer Organization, Operating Systems & System Software', desc: 'Von Neumann architecture, CPU/ALU/CU, Memory hierarchy, and OS functions (Process/Memory/File management).', t1: 'Block Diagram of Digital Computer (Von Neumann Architecture) & Memory Hierarchy', t2: 'Operating System Functions: Process, Memory, File & Device Management', formula1: 'Input Unit --> [ CPU: Control Unit + ALU + Registers ] <--> Main/Secondary Memory --> Output', formula2: 'Cache -> RAM -> SSD/HDD -> Magnetic Tape (Speed decreases, Capacity increases)' },
      { title: 'C++ Programming & Object-Oriented Methodology', desc: 'Tokens, Control structures, Functions, Classes & Objects, Constructors, Inheritance, and Polymorphism.', t1: 'Core Pillars of OOP: Encapsulation, Abstraction, Inheritance & Polymorphism in C++', t2: 'Constructors, Destructors, Function Overloading & Virtual Functions', formula1: 'class Student { private: int roll; public: Student(int r) : roll(r) {} };', formula2: 'Compile-Time Polymorphism (Overloading) vs Run-Time Polymorphism (Virtual Functions)' },
      { title: 'Data Structures & Algorithms Fundamentals', desc: 'Arrays, Stacks, Queues, Linked Lists, Binary Trees, and Searching/Sorting complexity.', t1: 'Stack (LIFO) vs Queue (FIFO) Operations & Applications', t2: 'Linear vs Binary Search and Bubble/Selection Sort Complexity', formula1: 'Stack: Push(top++) / Pop(top--)  |  Queue: Enqueue(rear++) / Dequeue(front++)', formula2: 'Binary Search Time Complexity: T(n) = T(n/2) + 1 = O(log₂ n)' },
      { title: 'Computer Networking & Internet Security', desc: 'LAN/MAN/WAN topologies, ISO-OSI 7-Layer Model, TCP/IP suite, Cyber threats, Firewalls & Cryptography.', t1: 'ISO-OSI 7-Layer Reference Model vs TCP/IP Protocol Architecture', t2: 'Cyber Security Threats (Malware, Phishing, DoS) & Firewall / Encryption Defenses', formula1: 'OSI 7 Layers: Physical -> Data Link -> Network -> Transport -> Session -> Presentation -> Application', formula2: 'Symmetric (AES) vs Asymmetric Public-Key Cryptography (RSA)' },
      { title: 'Database Management Systems & Cloud Computing Basics', desc: 'File system vs DBMS, Three-Schema Architecture, SQL DDL/DML commands, and Cloud IaaS/PaaS/SaaS models.', t1: 'DBMS vs Traditional File System & SQL DDL/DML Queries', t2: 'Cloud Computing Service Models (IaaS, PaaS, SaaS) & Deployment Models', formula1: 'SELECT dept, AVG(salary) FROM Employee GROUP BY dept HAVING AVG(salary) > 50000;', formula2: 'Cloud Stack: IaaS (EC2/VMs) -> PaaS (App Engine) -> SaaS (Gmail/Office 365)' },
    ],
  },
  {
    keywords: ['operating system', 'cs-405', 'al-501', 'cd-405'],
    units: [
      { title: 'Operating System Kernel, System Calls & Process Management', desc: 'Monolithic vs Microkernel, Process Control Block (PCB), Process States, and Threads.', t1: 'Process State Transition Diagram & Process Control Block (PCB)', t2: 'CPU Scheduling Algorithms: FCFS, SJF (SRTF), Priority & Round Robin Gantt Charts', formula1: 'Turnaround Time (TAT) = Completion Time (CT) - Arrival Time (AT)\nWaiting Time (WT) = TAT - Burst Time (BT)', formula2: 'Context Switch saves PCB_old registers/PC and loads PCB_new' },
      { title: 'Process Synchronization & Deadlocks', desc: 'Critical section problem, Peterson’s solution, Semaphores, Dining Philosophers, and Banker’s Algorithm.', t1: 'Deadlock Necessary Conditions (Coffman) & Banker’s Safety Algorithm', t2: 'Critical Section Problem, Semaphores (Wait/Signal) & Producer-Consumer Problem', formula1: 'Need[i][j] = Max[i][j] - Allocation[i][j]  (Grant if Need[i] ≤ Work)', formula2: 'Coffman 4 Conditions: Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait' },
      { title: 'Memory Management & Virtual Memory Paging', desc: 'First/Best/Worst fit, Paging & TLB, Segmentation, Demand Paging, Thrashing, and Page Replacement (FIFO, Optimal, LRU).', t1: 'Page Replacement Algorithms (FIFO, Optimal, LRU) & Belady’s Anomaly', t2: 'Paging Hardware with Translation Lookaside Buffer (TLB) & Effective Access Time (EAT)', formula1: 'EAT = α(t_TLB + t_mem) + (1 - α)(t_TLB + 2·t_mem)', formula2: 'Logical Address = (Page Number p, Page Offset d) -> Physical Frame f' },
      { title: 'Disk Scheduling, RAID & File Systems', desc: 'FCFS, SSTF, SCAN, C-SCAN, LOOK, C-LOOK disk arm scheduling, File allocation (Contiguous, Linked, Indexed/Inode).', t1: 'Disk Arm Scheduling (FCFS, SSTF, SCAN, C-SCAN, LOOK) Seek Time Calculation', t2: 'File Allocation Methods: Contiguous, Linked & UNIX Inode Indexed Allocation', formula1: 'Total Head Movement = Σ |Track_{i+1} - Track_i| cylinders', formula2: 'Direct Blocks (12) + Single Indirect + Double Indirect + Triple Indirect Inode Pointers' },
      { title: 'Protection, Security & Linux/UNIX Case Study', desc: 'Access matrix, Capability lists, Buffer overflow protection, and UNIX kernel architecture.', t1: 'Access Control Matrix, Domains of Protection & Capability Lists', t2: 'UNIX/Linux Kernel Architecture, Fork/Exec System Calls & Shell Pipeline', formula1: 'fork() returns 0 to Child Process and Child PID (>0) to Parent Process', formula2: 'Access Matrix(Domain_i, Object_j) ⊆ {Read, Write, Execute, Own}' },
    ],
  },
  {
    keywords: ['algorithm', 'cs-402', 'al-402', 'cd-403'],
    units: [
      { title: 'Asymptotic Analysis, Recurrences & Divide-and-Conquer', desc: 'Master Theorem, Substitution method, Binary Search, Merge Sort, Quick Sort, and Strassen’s Matrix Multiplication.', t1: 'Master Theorem for Recurrence Relations & Strassen’s O(n^2.81) Matrix Multiplication', t2: 'Divide-and-Conquer Quick Sort Partitioning & Best/Worst-Case Recurrence Analysis', formula1: 'T(n) = a T(n/b) + f(n)  ==> Compare f(n) with n^(log_b a)', formula2: 'Strassen uses 7 multiplications instead of 8: T(n) = 7T(n/2) + Θ(n²) = O(n^2.81)' },
      { title: 'Greedy Algorithms', desc: 'Fractional Knapsack, Job Sequencing with Deadlines, Huffman Coding, Prim’s & Kruskal’s MST, and Dijkstra.', t1: 'Fractional Knapsack Problem & Optimal Prefix-Free Huffman Coding Tree', t2: 'Job Sequencing with Deadlines & Greedy Minimum Spanning Tree (Prim/Kruskal)', formula1: 'Sort items by Profit/Weight ratio (p_i / w_i) in descending order: O(n log n)', formula2: 'Weighted External Path Length = Σ (Frequency_i × Codeword_Length_i)' },
      { title: 'Dynamic Programming (DP)', desc: '0/1 Knapsack, Longest Common Subsequence (LCS), Matrix Chain Multiplication, Floyd-Warshall All-Pairs Shortest Path, and Bellman-Ford.', t1: '0/1 Knapsack Problem & Longest Common Subsequence (LCS) DP Table', t2: 'Floyd-Warshall All-Pairs Shortest Path & Matrix Chain Multiplication', formula1: 'DP[i][w] = max( DP[i-1][w],  Profit[i] + DP[i-1][w - Weight[i]] )', formula2: 'D^k[i][j] = min( D^(k-1)[i][j],  D^(k-1)[i][k] + D^(k-1)[k][j] )' },
      { title: 'Backtracking & Branch-and-Bound', desc: 'N-Queens Problem (4-Queens/8-Queens state space tree), Sum of Subsets, Graph Coloring, and Travelling Salesperson (TSP) LC-Branch & Bound.', t1: 'N-Queens Problem Backtracking State-Space Tree & Bounding Function', t2: 'Travelling Salesperson Problem (TSP) using LC Branch-and-Bound Reduced Matrix', formula1: 'Bounding Check: Queen(k) at (k, i) conflicts if col[j]==i or |col[j]-i| == |j-k|', formula2: 'Reduced Cost C(node) = C(parent) + Edge(i,j) + Row/Col Reduction Sum' },
      { title: 'NP-Completeness & Approximation Algorithms', desc: 'P, NP, NP-Hard, and NP-Complete classes, Cook’s Theorem (SAT), 3-CNF SAT, Clique, and Vertex Cover.', t1: 'P, NP, NP-Hard & NP-Complete Complexity Classes (Venn Diagram) & Cook’s Theorem', t2: 'Polynomial-Time Reductions: 3-SAT to Clique & Vertex Cover Problem', formula1: 'L ∈ NP-Complete iff: (1) L ∈ NP, and (2) ∀ L\' ∈ NP, L\' ≤_p L (Polynomial Reduction)', formula2: 'Cook-Levin Theorem: Boolean Satisfiability (SAT) is NP-Complete' },
    ],
  },
  {
    keywords: ['theory of computation', 'cs-501', 'cd-501'],
    units: [
      { title: 'Finite Automata (DFA, NFA, ε-NFA) & Moore/Mealy Machines', desc: 'Deterministic vs Non-deterministic Finite Automata, Subset construction, Myhill-Nerode minimization, and Moore vs Mealy converters.', t1: 'NFA to DFA Conversion (Subset Construction) & DFA State Minimization', t2: 'Moore Machine vs Mealy Machine Equivalence & Inter-Conversion', formula1: 'DFA 5-Tuple: M = (Q, Σ, δ, q₀, F) where δ: Q × Σ --> Q', formula2: 'Moore Output λ: Q -> Δ (length n+1)  |  Mealy Output λ: Q × Σ -> Δ (length n)' },
      { title: 'Regular Expressions, Arden’s Theorem & Pumping Lemma', desc: 'Kleene closure, Arden’s Theorem (R = Q + RP => R = QP*), Thompson’s construction, and Pumping Lemma for Regular Languages.', t1: 'Arden’s Theorem (R = Q + RP = QP*) for Converting FA to Regular Expression', t2: 'Pumping Lemma for Regular Languages & Proving L = {a^n b^n | n ≥ 1} is Not Regular', formula1: 'Arden\'s Theorem: If R = Q + R·P and ε ∉ P, then R has unique solution R = Q·P*', formula2: 'Pumping Lemma: z = uvw with |uv| ≤ p, |v| ≥ 1  ==>  u v^i w ∈ L  ∀ i ≥ 0' },
      { title: 'Context-Free Grammars (CFG), Ambiguity & Normal Forms (CNF/GNF)', desc: 'Parse trees, Leftmost/Rightmost derivations, Removal of useless/ε/unit productions, Chomsky Normal Form (CNF) & Greibach Normal Form (GNF).', t1: 'Chomsky Normal Form (CNF: A -> BC | a) & Greibach Normal Form (GNF: A -> aα)', t2: 'Ambiguous Context-Free Grammars, Parse Trees & CYK Membership Algorithm', formula1: 'Chomsky Normal Form (CNF): All productions are of form A -> BC or A -> a', formula2: 'Greibach Normal Form (GNF): All productions are of form A -> a α (where α ∈ V*)' },
      { title: 'Pushdown Automata (PDA) & Context-Free Languages', desc: 'Deterministic vs Non-Deterministic PDA, Acceptance by final state vs empty stack, and CFG-to-PDA conversion.', t1: 'Pushdown Automata (PDA) Design for L = {wcw^R} and L = {a^n b^n | n ≥ 1}', t2: 'Equivalence of CFG and PDA & Deterministic vs Non-Deterministic PDA (DPDA vs NPDA)', formula1: 'PDA 7-Tuple: M = (Q, Σ, Γ, δ, q₀, Z₀, F) with δ(q, a, X) = {(p, γ)}', formula2: 'NPDA is strictly more powerful than DPDA (e.g., L = {ww^R} requires NPDA)' },
      { title: 'Turing Machines, Chomsky Hierarchy & Undecidability', desc: 'Standard Turing Machine design, Halting Problem, Post Correspondence Problem (PCP), Rice’s Theorem, and Chomsky Hierarchy.', t1: 'Turing Machine Design for L = {a^n b^n c^n | n ≥ 1} & Multi-Tape TMs', t2: 'Chomsky Hierarchy (Type 0, 1, 2, 3), Halting Problem & Post Correspondence Problem', formula1: 'Type 3 (Regular/FA) ⊂ Type 2 (CFL/PDA) ⊂ Type 1 (CSL/LBA) ⊂ Type 0 (RE/Turing Machine)', formula2: 'Halting Problem H_TM = {<M, w> | M halts on input w} is Recursive Enumerable but Undecidable' },
    ],
  },
  {
    keywords: ['network', 'cs-602', 'al-601', 'cd-602', 'ec-603(a)'],
    units: [
      { title: 'OSI vs TCP/IP Architecture & Physical Layer', desc: 'Layered protocol suites, Guided/Unguided media, Nyquist & Shannon channel capacity, and Circuit vs Packet switching.', t1: 'ISO-OSI 7-Layer Model vs TCP/IP Suite & Encapsulation Headers', t2: 'Nyquist Bit Rate, Shannon Capacity Theorem & Packet vs Circuit Switching', formula1: 'Nyquist: C = 2B log₂(L) bps   |   Shannon: C = B log₂(1 + SNR) bps', formula2: 'Total Packet Delay = Transmission (L/R) + Propagation (d/v) + Queuing + Processing' },
      { title: 'Data Link Layer: Framing, CRC Error Detection, Sliding Window & MAC', desc: 'Hamming code, Cyclic Redundancy Check (CRC), Stop-and-Wait, Go-Back-N, Selective Repeat ARQ, and CSMA/CD vs CSMA/CA.', t1: 'Cyclic Redundancy Check (CRC) Polynomial Division & Sliding Window ARQ (GBN vs SR)', t2: 'CSMA/CD (Ethernet IEEE 802.3) Minimum Frame Size & Binary Exponential Backoff', formula1: 'Stop-and-Wait Efficiency η = 1 / (1 + 2a), where a = T_prop / T_trans', formula2: 'CSMA/CD Constraint: T_trans ≥ 2 × T_prop  ==>  L_min / B ≥ 2d / v' },
      { title: 'Network Layer: IPv4/IPv6 Subnetting & Routing Algorithms (OSPF, BGP)', desc: 'Classful vs CIDR Subnetting, ARP/DHCP/ICMP, Distance Vector (Bellman-Ford / Count-to-Infinity) vs Link State (Dijkstra / OSPF) routing.', t1: 'IPv4 CIDR Subnet Masking & Distance Vector (RIP) vs Link State (OSPF) Routing', t2: 'IPv4 Header Format vs IPv6 Header & NAT / ICMP Protocols', formula1: 'Usable Hosts per Subnet = 2^(32 - Prefix_Length) - 2', formula2: 'Bellman-Ford: D_x(y) = min_v { c(x,v) + D_v(y) }' },
      { title: 'Transport Layer: UDP, TCP 3-Way Handshake & Congestion Control', desc: 'TCP segment header, 3-Way Handshake connection establishment, Slow Start, Congestion Avoidance (AIMD), and Leaky/Token Bucket QoS.', t1: 'TCP 3-Way Handshake (SYN, SYN-ACK, ACK) & TCP Congestion Control (Slow Start / AIMD)', t2: 'TCP vs UDP Header Comparison & Leaky Bucket vs Token Bucket Traffic Shaping', formula1: 'Slow Start: cwnd doubles every RTT (exponential) until ssthresh, then +1 MSS linear', formula2: 'EstimatedRTT = (1 - α)·EstimatedRTT + α·SampleRTT  (α = 0.125)' },
      { title: 'Application Layer: DNS, HTTP, SMTP & Network Security', desc: 'Recursive vs Iterative DNS resolution, HTTP/HTTPS, SMTP/POP3/IMAP, RSA public-key encryption, and Firewalls.', t1: 'DNS Hierarchy (Recursive vs Iterative Query) & HTTP Request/Response Pipeline', t2: 'RSA Asymmetric Encryption Algorithm & Packet-Filter / Stateful Firewalls', formula1: 'RSA: n = p·q, φ(n) = (p-1)(q-1), e·d ≡ 1 (mod φ(n)), Cipher C = M^e mod n, M = C^d mod n', formula2: 'HTTPS = HTTP over TLS/SSL (Port 443) vs HTTP (Port 80), DNS (Port 53), SMTP (Port 25)' },
    ],
  },
  {
    keywords: ['machine learning', 'artificial intelligence', 'deep learning', 'data science', 'cs-601', 'al-304', 'al-405', 'al-503', 'cd-402', 'cd-502', 'cd-603'],
    units: [
      { title: 'Foundations of Learning, Search & Regression Models', desc: 'Supervised vs Unsupervised vs Reinforcement learning, A* Heuristic Search, Linear & Polynomial Regression, and Gradient Descent.', t1: 'Linear Regression (Ordinary Least Squares) & Gradient Descent Optimization', t2: 'Bias-Variance Tradeoff, Overfitting & L1 (Lasso) vs L2 (Ridge) Regularization', formula1: 'MSE Loss J(θ) = (1/2m) Σ (h_θ(x^(i)) - y^(i))²   |   θ_j := θ_j - α (∂J/∂θ_j)', formula2: 'Total Expected Error = Bias² + Variance + Irreducible Noise (σ²)' },
      { title: 'Classification: Logistic Regression, Decision Trees & SVM', desc: 'Sigmoid function, Cross-entropy loss, ID3/CART Information Gain & Gini Impurity, and Maximum-Margin Support Vector Machines (SVM).', t1: 'Decision Tree ID3 Algorithm (Entropy & Information Gain) & Gini Impurity', t2: 'Support Vector Machine (SVM) Maximum-Margin Hyperplane & Kernel Trick (RBF)', formula1: 'Entropy H(S) = -Σ p_i log₂(p_i)   |   InfoGain(S, A) = H(S) - Σ (|S_v|/|S|) H(S_v)', formula2: 'Hard-Margin SVM: Minimize (1/2)||w||² subject to y_i(w·x_i + b) ≥ 1' },
      { title: 'Ensemble Learning & Probabilistic Models (Naive Bayes)', desc: 'Bayes Theorem, Gaussian/Multinomial Naive Bayes, Bagging (Random Forest) vs Boosting (AdaBoost, XGBoost).', t1: 'Naive Bayes Classifier with Laplace Smoothing & Spam Classification Numerical', t2: 'Bagging (Random Forest) vs Boosting (AdaBoost / Gradient Boosting) Comparison', formula1: 'P(Y=c | X) ∝ P(Y=c) × Π P(x_j | Y=c)', formula2: 'Bagging reduces Variance (parallel trees); Boosting reduces Bias (sequential weighted trees)' },
      { title: 'Unsupervised Learning: K-Means Clustering & PCA Dimensionality Reduction', desc: 'K-Means & Hierarchical clustering, Silhouette score, Principal Component Analysis (PCA) Covariance Eigenvectors, and Apriori.', t1: 'K-Means Clustering Algorithm & Principal Component Analysis (PCA) Covariance Steps', t2: 'Hierarchical Agglomerative Clustering (Single/Complete Linkage) & Elbow Method', formula1: 'K-Means Objective (WCSS): J = Σ_k Σ_{x_i ∈ C_k} ||x_i - μ_k||²', formula2: 'PCA: Compute Covariance Σ = (1/n) X^T X  ==>  Solve Σ v = λ v for top-k Eigenvectors' },
      { title: 'Neural Networks, Backpropagation, CNNs & Model Evaluation Metrics', desc: 'Multi-Layer Perceptron (MLP), Activation functions (ReLU, Sigmoid, Softmax), Backpropagation chain rule, CNNs, and Confusion Matrix / ROC-AUC.', t1: 'Backpropagation Chain Rule in Multi-Layer Perceptrons & Activation Functions (ReLU/Softmax)', t2: 'Confusion Matrix, Precision, Recall, F1-Score & ROC-AUC Curve', formula1: 'Precision = TP / (TP + FP)  |  Recall = TP / (TP + FN)  |  F1 = 2·P·R / (P + R)', formula2: 'CNN Output Dimension = ⌊ (W - F + 2P) / S ⌋ + 1' },
    ],
  },
];

function generateDomainSpecificSubjectCurriculum(
  subjectCode: string,
  subjectName: string
): { units: Unit[]; pyqs: PYQQuestion[] } {
  const combined = `${subjectCode} ${subjectName}`.toLowerCase();
  const matchedDomain = DOMAIN_UNIT_MAP.find((d) =>
    d.keywords.some((kw) => combined.includes(kw))
  );

  if (matchedDomain) {
    const bp: QuickSubjectBlueprint = {
      units: matchedDomain.units.map((u) => ({
        title: u.title,
        desc: u.desc,
        t1Title: u.t1,
        t1DefEn: `${u.t1} is a high-weightage core topic in ${subjectCode} (${subjectName}) covering ${u.desc} In university examinations, answers must state the formal mathematical/architectural principle, draw the labeled block/flow diagram, and derive the governing relation: ${u.formula1}.`,
        t1DefHi: `${u.t1} (${subjectCode} - ${subjectName}) university exam ka ek bahut important topic hai. Iske answer mein formal definition, neat labeled diagram, aur main relation (${u.formula1}) ka step-by-step derivation likhna zaroori hai.`,
        t1Q: `Explain ${u.t1} in detail with a neat labeled diagram, mathematical derivation, and suitable engineering example for ${subjectName}.`,
        t1Code: u.formula1,
        t2Title: u.t2,
        t2DefEn: `${u.t2} addresses the practical design, analysis, and optimization criteria in ${subjectName}. Key governing relation and structure: ${u.formula2}.`,
        t2DefHi: `${u.t2} (${subjectName}) mein system analysis aur comparison ke liye ${u.formula2} ka upyog kiya jata hai.`,
        t2Q: `Discuss ${u.t2} and solve/illustrate its working step-by-step with reference to ${subjectCode} (${subjectName}).`,
        t2Code: u.formula2,
      })),
    };
    return convertQuickBlueprintToCurriculum(subjectCode, subjectName, bp);
  }

  // Fallback tailored strictly to the selected subjectName & subjectCode (never DBMS!)
  const genericBp: QuickSubjectBlueprint = {
    units: [
      {
        title: `Fundamentals & Core Architecture of ${subjectName}`,
        desc: `Foundational principles, mathematical modeling, system architecture, and design standards in ${subjectName} (${subjectCode}).`,
        t1Title: `${subjectName}: Core Architecture, Block Diagram & Working Principles`,
        t1DefEn: `The foundational architecture of ${subjectName} (${subjectCode}) defines the core functional blocks, signal/data flow interfaces, governing equations, and performance metrics required to analyze engineering systems.`,
        t1DefHi: `${subjectName} (${subjectCode}) ka core architecture system ke main blocks, data/signal flow, aur performance metrics ko define karta hai.`,
        t1Q: `Draw and explain the complete architectural block diagram of ${subjectName} (${subjectCode}) and discuss the role of each functional component.`,
        t1Code: `[Input / Source Stage] --> [Core Processing / Model Block (${subjectCode})] --> [Control & Verification] --> [Output Stage]`,
        t2Title: `Classification, Design Parameters & Performance Metrics in ${subjectName}`,
        t2DefEn: `Systems in ${subjectName} are evaluated across efficiency, throughput, stability, accuracy, and resource overhead using standardized engineering benchmarks.`,
        t2DefHi: `${subjectName} mein systems ko efficiency, accuracy, stability, aur throughput ke aadhar par compare kiya jata hai.`,
        t2Q: `Compare the primary classification models in ${subjectName} across architecture, efficiency, complexity, and real-world applications.`,
        t2Code: `Efficiency (η) = (Useful Output / Total Input) × 100%`,
      },
      {
        title: `Analytical Models, Equations & Design Methodology in ${subjectName}`,
        desc: `Mathematical formulations, state transitions, step-by-step derivations, and analytical problem solving in ${subjectName}.`,
        t1Title: `Mathematical Modeling & Step-by-Step Derivation in ${subjectName}`,
        t1DefEn: `Analytical modeling in ${subjectName} formulates system behavior using state variables, transfer equations, and boundary constraints to predict exact outputs under varying loads.`,
        t1DefHi: `${subjectName} mein analytical modeling ke zariye input, state variables, aur boundary conditions se output calculate kiya jata hai.`,
        t1Q: `Derive the governing analytical equation for ${subjectName} (${subjectCode}) and state all underlying assumptions and boundary conditions.`,
        t1Code: `State Equation: Y(s) = H(s) · X(s)  |  Apply Boundary Conditions & Solve Step-by-Step`,
        t2Title: `Design Constraints, Trade-offs & Optimization Techniques`,
        t2DefEn: `Engineering design in ${subjectName} balances speed, accuracy, power/memory cost, and fault tolerance using structured optimization criteria.`,
        t2DefHi: `${subjectName} ke system design mein speed, accuracy, aur cost ke beech balance banaya jata hai.`,
        t2Q: `Explain the key design trade-offs and optimization methods used in ${subjectName} with a neat diagram.`,
        t2Code: `Objective: Minimize Cost/Error J(x) subject to system capacity constraints`,
      },
      {
        title: `Core Mechanisms, Protocols & Implementation in ${subjectName}`,
        desc: `Operational workflows, algorithms/circuits, timing analysis, and implementation blocks for ${subjectName}.`,
        t1Title: `Operational Workflow & Execution Pipeline of ${subjectName}`,
        t1DefEn: `The execution pipeline of ${subjectName} coordinates sequential and parallel processing stages with error checking and feedback control.`,
        t1DefHi: `${subjectName} ka execution pipeline step-by-step processing aur feedback control ko manage karta hai.`,
        t1Q: `Explain the end-to-end operational workflow of ${subjectName} with a sequence/flow diagram and step-by-step trace.`,
        t1Code: `Stage 1: Initialization --> Stage 2: Transformation --> Stage 3: Validation --> Stage 4: Output`,
        t2Title: `Error Handling, Fault Tolerance & Stability Analysis`,
        t2DefEn: `Fault-tolerant mechanisms in ${subjectName} detect anomalies early and maintain stable operation under noise or unexpected inputs.`,
        t2DefHi: `${subjectName} mein fault tolerance system ko errors aur disturbance ke bawajood stable rakhta hai.`,
        t2Q: `How are errors and system instabilities detected and mitigated in ${subjectName}? Explain with examples.`,
        t2Code: `Closed-Loop Feedback: Error e(t) = Reference r(t) - Measured Output y(t)`,
      },
      {
        title: `Advanced Techniques & Comparative Analysis in ${subjectName}`,
        desc: `Advanced architectures, performance enhancement, and comparative evaluation of techniques in ${subjectName}.`,
        t1Title: `Advanced Architectures & Performance Enhancement in ${subjectName}`,
        t1DefEn: `Modern advancements in ${subjectName} leverage pipelining, modularity, and adaptive control to achieve superior scalability and precision.`,
        t1DefHi: `${subjectName} ke advanced architectures modularity aur adaptive techniques se high performance dete hain.`,
        t1Q: `Discuss the advanced architectural improvements in ${subjectName} and compare them with conventional approaches in a tabular format.`,
        t1Code: `Conventional Approach vs Advanced ${subjectCode} Architecture (Speed, Scalability, Reliability)`,
        t2Title: `Real-World Case Studies & Numerical Problem Solving in ${subjectName}`,
        t2DefEn: `Practical problem solving in ${subjectName} applies unit formulas to compute system parameters and verify compliance with engineering standards.`,
        t2DefHi: `${subjectName} ke numericals mein standard formulas lagakar system parameters verify kiye jate hain.`,
        t2Q: `Solve a standard design problem in ${subjectName} showing all given data, formulas used, and units.`,
        t2Code: `Step 1: Given Data in SI Units -> Step 2: Formula Selection -> Step 3: Substitution & Boxed Answer`,
      },
      {
        title: `Industrial Applications, Standards & Emerging Trends in ${subjectName}`,
        desc: `Industry standards, testing & verification, and next-generation applications of ${subjectName}.`,
        t1Title: `Industrial Applications & System Integration of ${subjectName}`,
        t1DefEn: `System integration of ${subjectName} connects core modules with real-world sensors, networks, or enterprise workflows while adhering to IEEE/BIS/ISO standards.`,
        t1DefHi: `${subjectName} ka industrial integration real-world systems aur IEEE/BIS standards ke sath kaam karta hai.`,
        t1Q: `Write a detailed technical note on the industrial applications, testing methodology, and future scope of ${subjectName}.`,
        t1Code: `Verification Flow: Unit Testing --> Integration Testing --> System Calibration --> Deployment`,
        t2Title: `Security, Reliability & Quality Assurance in ${subjectName}`,
        t2DefEn: `Quality assurance and reliability engineering ensure that ${subjectName} deployments meet strict uptime and safety benchmarks.`,
        t2DefHi: `${subjectName} mein reliability aur quality assurance system ki safety aur uptime sunishchit karte hain.`,
        t2Q: `Explain the reliability metrics and quality assurance standards applicable to ${subjectName}.`,
        t2Code: `Reliability R(t) = e^(-λt)   |   Availability = MTBF / (MTBF + MTTR)`,
      },
    ],
  };

  return convertQuickBlueprintToCurriculum(subjectCode, subjectName, genericBp);
}

export function getCurriculumForSubject(
  subjectCode: string,
  subjectName: string
): { units: Unit[]; pyqs: PYQQuestion[] } {
  return generateDynamicCurriculumForSubject(subjectCode, subjectName);
}
