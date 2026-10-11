PAPEL TALES STARTER KIT
=======================
Everything needed to make another narrated paper-cut story video the same way as
"Mabuhay ang Fiesta" and "Were You Here Before?", and upload it to the
Papel Tales YouTube channel.

paper-story-video-instructions.txt  The full recipe, standing rules, and every fix learned.
examples/fiesta.html                Finished story page: paper helpers, characters
                                    (carabao, tarsier, people, church, banderitas, fireworks...).
examples/reincarnation.html         Finished story page: tortoise, fox, ghosts, wheel, map...
examples/fiesta-voiceover-script.txt Script format + pronunciation guide format.
scripts/lines.js     Pull narration lines out of a story page.
scripts/tts3.py      Kokoro narration with exact pronunciations (fil.json), years spoken out.
scripts/fil.json     Pronunciation list (IPA) for Filipino words and names.
scripts/audio.py     Timeline + festive music + mix.
scripts/render1440.js 1440p renderer: smooth crossfades, moving camera, framed subtitles.
scripts/thumb.js     Thumbnail maker (1280x720).

Order: write story page -> lines.js -> tts3.py -> audio.py -> preview frames ->
render1440.js -> two-pass compress to ~95 MB -> thumbnail -> GitHub -> YouTube (Public).
Paths inside the scripts point at ../voice and ../lib; adjust to where you run them.
