import re
import json

def parse_html_style_text(input_text):
    # Regular expression to match opening and closing tags
    tag_pattern = r'<(b|i|font color="#[0-9a-fA-F]{6})>'
    
    # Initialize variables
    formatted_text = []
    char_info = {'text': '', 'color': 'white', 'bold': False, 'italic': False}
    tag_stack = []

    # Find all tags in the input text
    tags = re.findall(tag_pattern, input_text)

    for tag in tags:
        if tag.startswith('<b>'):
            char_info['bold'] = True
        elif tag.startswith('<i>'):
            char_info['italic'] = True
        elif tag.startswith('<font color="'):
            color_match = re.search(r'#([0-9a-fA-F]{6})', tag)
            char_info['color'] = color_match.group(1)
        else:  # Handle closing tags
            if tag.startswith('</b>') and char_info['bold']:
                char_info['bold'] = False
            elif tag.startswith('</i>') and char_info['italic']:
                char_info['italic'] = False
            elif tag.startswith('</font'):
                char_info['color'] = 'white'

        if tag.startswith('<') and not tag.startswith('</'):
            tag_stack.append(char_info.copy())

    # Extract text and create objects
    text_pattern = r'>([^<]+)'
    texts = re.findall(text_pattern, input_text)
    for text in texts:
        if tag_stack:
            char_info = tag_stack.pop()
        else:
            char_info = {'text': text, 'color': 'white', 'bold': False, 'italic': False}
        char_info['text'] = text
        formatted_text.append(char_info.copy())

    # Convert the formatted_text list to JSON
    json_output = json.dumps(formatted_text, indent=2)
    return json_output

# Example usage:
html_text = '<b>o</b>ba<font color="#ff0000"><i>a</i></font>'
json_output = parse_html_style_text(html_text)
print(json_output)
