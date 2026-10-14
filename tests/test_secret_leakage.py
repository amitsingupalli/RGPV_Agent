import os
import re
import subprocess
import pytest


def test_secret_files_are_gitignored():
    """Verifies that .env, env.txt, and secret files are strictly listed in .gitignore."""
    gitignore_path = os.path.abspath(".gitignore")
    assert os.path.exists(gitignore_path), ".gitignore file must exist in repository root."

    with open(gitignore_path, "r", encoding="utf-8") as f:
        content = f.read()

    assert "env.txt" in content, "env.txt must be listed in .gitignore"
    assert ".env" in content, ".env must be listed in .gitignore"
    assert "**/env.txt" in content, "**/env.txt must be listed in .gitignore"


def test_no_api_keys_leaked_in_git_tracked_files():
    """Scans all git-tracked files to ensure no real Google/Gemini API key is committed."""
    # Pattern for Google/Gemini API keys (starts with AIzaSy followed by 33 characters)
    gemini_key_pattern = re.compile(r"\bAIzaSy[A-Za-z0-9_-]{33}\b")

    try:
        # Get list of git tracked files
        result = subprocess.run(
            ["git", "ls-files"],
            capture_output=True,
            text=True,
            check=True
        )
        tracked_files = result.stdout.strip().splitlines()
    except Exception:
        # Fallback if git is not in PATH during test
        pytest.skip("Git command not available to check tracked files.")

    leaked_files = []

    for file_path in tracked_files:
        # Skip binary files or images
        if any(file_path.endswith(ext) for ext in [".png", ".jpg", ".jpeg", ".ico", ".pdf", ".lock"]):
            continue

        if not os.path.exists(file_path):
            continue

        try:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
                if gemini_key_pattern.search(content):
                    leaked_files.append(file_path)
        except Exception:
            pass

    assert len(leaked_files) == 0, f"Found unmasked API key in git-tracked files: {leaked_files}"
