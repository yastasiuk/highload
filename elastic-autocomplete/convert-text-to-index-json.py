input_file = "dictionary.txt"
output_file = "bulk_data.json"

with open(input_file, 'r') as f, open(output_file, 'w') as out:
    i = 0
    for line in f:
        i += 1
        word = line.strip()  # Remove any trailing whitespace
        # Write the action metadata
        out.write(f'{{"index": {{"_index": "lexicanum", "_id": {i} }}}}\n')
        # Write the document data
        out.write(f'{{"short_word": "{word}", "long_word": "{word}"}}\n')
