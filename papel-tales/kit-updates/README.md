# Papel Tales kit updates (11 October 2026)

Add these to the starter kit. They are standing rules from the user.

## Narration: use `tts4.py` (replaces `tts3.py`) with `heteronyms.py` beside it
- Fixes words spelled the same but said differently. First fix: "lives" as a verb
  ("an aswang lives in the next village") is now "livz", not "layvz". "Long live", "lived",
  "living" are "liv"; "their lives", "many lives" stay "layvz"; "live music" stays "layv".
- Every run writes `pronunciation_audit.txt`, listing each risky word (live, read, lead, wind,
  tear, close, wound, bow, minute, present, record...) with its line. Check each one in
  `phonemes.txt` **before rendering** and show the list with the pronunciation guide.
- When the user reports a misread word, add a rule to `RULES` in `heteronyms.py`
  (context regex plus IPA) and re-run. Do not just respell the subtitle.

## Every story
- New characters every time (see ANIMATION-TOOLKIT.md for the ones already used).
- Mixed cut-out styles per scene.

## YouTube: reach outside the Philippines, especially the US
- Title for people who have never heard of the topic, e.g.
  "The Aswang: The Philippine Vampire Legend Explained | Papel Tales".
- After upload, set `defaultLanguage` and `defaultAudioLanguage` to `en-US`. The Composio update tool
  has no field for this; use the workbench:
  `proxy_execute('PUT','https://www.googleapis.com/youtube/v3/videos','youtube',query_params={'part':'snippet'},body={'id':VID,'snippet':{title,categoryId,description,tags,'defaultLanguage':'en-US','defaultAudioLanguage':'en-US'}})`
- Make an `.srt` from timeline.json + lines.json and commit it beside the video. Composio cannot
  upload captions (the multipart and resumable caption uploads both fail through its proxy), so the
  user uploads it in YouTube Studio: Subtitles, then Add language English, then Upload file.
- Suggest scheduling for US evening (6 to 9 PM Eastern, about 6 to 9 AM Philippine time) and a Short.
