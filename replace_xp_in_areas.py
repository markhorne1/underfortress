#!/usr/bin/env python3
"""
Script to replace all instances of "type": "addXP" with "type": "addStatPoints" 
in the areas.json file.
"""

import json
import sys

def replace_addxp_in_file(filepath):
    """Replace addXP with addStatPoints in the JSON file."""
    print(f"Reading {filepath}...")
    
    # Read the file as text (not JSON) to preserve formatting
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Count occurrences before replacement
    count_before = content.count('"type": "addXP"')
    print(f"Found {count_before} instances of '\"type\": \"addXP\"'")
    
    # Perform replacement
    new_content = content.replace('"type": "addXP"', '"type": "addStatPoints"')
    
    # Count occurrences after replacement
    count_after = new_content.count('"type": "addXP"')
    replacements_made = count_before - count_after
    
    print(f"Made {replacements_made} replacements")
    print(f"Remaining instances: {count_after}")
    
    # Write back to file
    if replacements_made > 0:
        print(f"Writing changes to {filepath}...")
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print("Done!")
        return True
    else:
        print("No changes needed.")
        return False

if __name__ == '__main__':
    filepath = '/workspaces/underfortress/content/areas.json'
    try:
        success = replace_addxp_in_file(filepath)
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)
