import os
import re
from typing import Dict, List, Optional, Tuple

class SkillMetadata:
    def __init__(self, id: str, name: str, description: str, triggers: List[str], positive_examples: List[str], negative_examples: List[str], file_path: str):
        self.id = id
        self.name = name
        self.description = description
        self.triggers = triggers
        self.positive_examples = positive_examples
        self.negative_examples = negative_examples
        self.file_path = file_path

class SkillManager:
    def __init__(self, skills_dir: str = None):
        if skills_dir is None:
            # Locate relative to this file
            skills_dir = os.path.dirname(os.path.abspath(__file__))
        self.skills_dir = skills_dir
        self.skills: Dict[str, SkillMetadata] = {}
        self.load_skills()

    def load_skills(self):
        self.skills = {}
        if not os.path.exists(self.skills_dir):
            return
        for entry in os.listdir(self.skills_dir):
            entry_path = os.path.join(self.skills_dir, entry)
            if os.path.isdir(entry_path) and not entry.startswith("__"):
                skill_md_path = os.path.join(entry_path, "SKILL.md")
                if os.path.exists(skill_md_path):
                    try:
                        with open(skill_md_path, "r", encoding="utf-8") as f:
                            content = f.read()
                        
                        metadata, body = self.parse_frontmatter(content)
                        if metadata and "id" in metadata:
                            skill_id = metadata["id"]
                            self.skills[skill_id] = SkillMetadata(
                                id=skill_id,
                                name=metadata.get("name", entry),
                                description=metadata.get("description", ""),
                                triggers=metadata.get("triggers", []),
                                positive_examples=metadata.get("positive_examples", []),
                                negative_examples=metadata.get("negative_examples", []),
                                file_path=skill_md_path
                            )
                    except Exception as e:
                        print(f"Error loading skill {entry}: {e}")

    def parse_frontmatter(self, content: str) -> Tuple[dict, str]:
        parts = content.split("---", 2)
        if len(parts) >= 3:
            frontmatter_text = parts[1]
            body_text = parts[2]
            metadata = {}
            current_key = None
            for line in frontmatter_text.splitlines():
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                if ":" in line and not line.startswith("-"):
                    key, val = line.split(":", 1)
                    key = key.strip()
                    val = val.strip()
                    if val.startswith("[") and val.endswith("]"):
                        val = [v.strip().strip('"').strip("'") for v in val[1:-1].split(",") if v.strip()]
                        metadata[key] = val
                    elif val == "":
                        metadata[key] = []
                        current_key = key
                    else:
                        metadata[key] = val.strip('"').strip("'")
                        current_key = None
                elif line.startswith("-") and current_key:
                    val = line[1:].strip().strip('"').strip("'")
                    metadata[current_key].append(val)
            return metadata, body_text
        return {}, content

    def match_skill(self, query: str) -> Optional[SkillMetadata]:
        # Scoring based on triggers matching keywords/phrases in query
        query_lower = query.lower()
        best_skill = None
        max_score = 0
        
        for skill in self.skills.values():
            score = 0
            for trigger in skill.triggers:
                trigger_lower = trigger.lower()
                # 1. Whole word/phrase matching (highest weight)
                if re.search(r'\b' + re.escape(trigger_lower) + r'\b', query_lower):
                    score += len(trigger_lower) * 3
                # 2. Substring matching for phrases (e.g. "encroach" in "encroached")
                elif len(trigger_lower) > 3 and trigger_lower in query_lower:
                    score += len(trigger_lower) * 2
                # 3. Handle base form matching for common suffixes (e.g. "encroachment" -> "encroach")
                elif trigger_lower.endswith("ment") and len(trigger_lower) > 8 and trigger_lower[:-4] in query_lower:
                    score += (len(trigger_lower) - 4) * 2
                # 4. Check if any individual word of the trigger (if multi-word) matches a word in the query
                elif " " in trigger_lower:
                    for part in trigger_lower.split():
                        if len(part) > 4 and re.search(r'\b' + re.escape(part) + r'\b', query_lower):
                            score += len(part)
            if score > max_score:
                max_score = score
                best_skill = skill
        return best_skill

    def get_skill_prompt(self, skill_id: str) -> str:
        skill = self.skills.get(skill_id)
        if not skill:
            return ""
        try:
            with open(skill.file_path, "r", encoding="utf-8") as f:
                content = f.read()
            metadata, body = self.parse_frontmatter(content)
            return body.strip()
        except Exception as e:
            print(f"Error loading skill file for prompt {skill_id}: {e}")
            return ""
