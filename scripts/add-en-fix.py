import re

with open('src/lib/spellcheck-dicts.ts', 'r') as f:
    content = f.read()

# 1. Add EN section before ES
en_section = '''  en: {
  "dont": "don't", "doesnt": "doesn't", "cant": "can't",
  "wont": "won't", "wouldnt": "wouldn't", "couldnt": "couldn't",
  "shouldnt": "shouldn't", "isnt": "isn't", "arent": "aren't",
  "wasnt": "wasn't", "werent": "weren't", "hasnt": "hasn't",
  "havent": "haven't", "hadnt": "hadn't", "didnt": "didn't",
  "im": "I'm", "ive": "I've", "ill": "I'll", "id": "I'd",
  "youre": "you're", "youve": "you've", "youll": "you'll",
  "hes": "he's", "shes": "she's",
  "were": "we're", "theyre": "they're", "weve": "we've",
  "theyve": "they've", "theyll": "they'll",
  "thats": "that's", "whos": "who's", "whats": "what's",
  "theres": "there's", "heres": "here's", "lets": "let's",
  "pls": "please", "thx": "thanks", "ty": "thank you",
  "np": "no problem", "imo": "in my opinion",
  "btw": "by the way", "fyi": "for your information",
  "tbh": "to be honest", "afaik": "as far as I know",
  "brb": "be right back", "afk": "away from keyboard",
  "idk": "I don't know", "nvm": "never mind",
  "rn": "right now", "tho": "though", "cuz": "because",
  "gonna": "going to", "wanna": "want to", "gotta": "got to",
  "u": "you", "ur": "your", "r": "are", "y": "why",
  "teh": "the", "recieve": "receive", "acheive": "achieve",
  "definately": "definitely", "seperate": "separate",
  "occured": "occurred", "untill": "until",
  "goverment": "government", "enviroment": "environment",
  "neccessary": "necessary", "accomodate": "accommodate",
  "tommorow": "tomorrow", "succesful": "successful",
  "begining": "beginning", "beleive": "believe",
  "calender": "calendar", "collegue": "colleague",
  "concious": "conscious", "embarass": "embarrass",
  "existance": "existence", "expirience": "experience",
  "foriegn": "foreign", "freind": "friend",
  "happend": "happened", "knowlege": "knowledge",
  "maintainance": "maintenance", "millenium": "millennium",
  "noticable": "noticeable", "occassion": "occasion",
  "privilege": "privilege", "profesional": "professional",
  "realise": "realize", "reccomend": "recommend",
  "referred": "referred", "relevent": "relevant",
  "religious": "religious", "remember": "remember",
  "resistence": "resistance", "suprise": "surprise",
  "truely": "truly", "wierd": "weird", "writting": "writing",
  },
'''

content = content.replace('  es: {', en_section + '  es: {')

# 2. Add missing PT entries
pt_additions = '  "porem": "porém",\n  "contanto": "contudo",\n  "tudo": "tudo",\n'
content = content.replace('  "cla": "clã",', pt_additions + '  "cla": "clã",')

# 3. Fix grammar rules: change (?:...) to (...) for capturing groups
content = content.replace(
    '(?:but|however|nevertheless|therefore|furthermore|moreover|consequently|meanwhile)',
    '(but|however|nevertheless|therefore|furthermore|moreover|consequently|meanwhile)'
)
content = content.replace(
    '(?:pero|sin embargo|no obstante|por lo tanto|por consiguiente)',
    '(pero|sin embargo|no obstante|por lo tanto|por consiguiente)'
)
content = content.replace(
    '(?:mais|cependant|néanmoins|toutefois|pourtant|donc|par conséquent)',
    '(mais|cependant|néanmoins|toutefois|pourtant|donc|par conséquent)'
)
content = content.replace(
    '(?:ma|però|tuttavia|dunque|quindi|pertanto)',
    '(ma|però|tuttavia|dunque|quindi|pertanto)'
)

with open('src/lib/spellcheck-dicts.ts', 'w') as f:
    f.write(content)

print('Done: Added EN section, PT entries, fixed grammar groups')