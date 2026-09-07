# from google import genai

# client = genai.Client()

# interaction = client.interactions.create(
#     model="gemini-3.7-flash",
#     input="Explain how AI works in a few words"
# )

# print(interaction.output_text)

import os
from google import genai

client = genai.Client(
    api_key=os.environ.get("GEMINI_API_KEY"),
)

generation_config = {
    'temperature': 1,
    'max_output_tokens': 65536,
    'top_p': 0.95,
    'thinking_level': 'high',
}

interaction = client.interactions.create(
    model='models/gemini-3-flash-preview',
    input="""hi""",
    generation_config=generation_config,
)

print(interaction.output_text)


