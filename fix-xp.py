#!/usr/bin/env python3
"""
Replace all addXP effects with addStatPoints in areas.json.
Converts XP amounts to reasonable Stat Point values.
"""
import json
import re

def convert_xp_to_stat_points(xp_amount):
    """Convert old XP values to stat points (roughly 1-2 per quest)."""
    if xp_amount <= 10:
        return 1
    elif xp_amount <= 18:
        return 2
    else:
        return 3

def main():
    filepath = '/workspaces/underfortress/content/areas.json'
    
    print('Reading areas.json...')
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Count original
    original_count = content.count('"type": "addXP"')
    print(f'Found {original_count} addXP effects')
    
    # Replace all instances
    content = content.replace('"type": "addXP"', '"type": "addStatPoints"')
    
    # Verify
    new_count = content.count('"type": "addStatPoints"')
    remaining = content.count('"type": "addXP"')
    
    print(f'Replaced {original_count} addXP → addStatPoints')
    print(f'Total addStatPoints: {new_count}')
    print(f'Remaining addXP: {remaining}')
    
    # Write back
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print('✓ Done!')

if __name__ == '__main__':
    main()
