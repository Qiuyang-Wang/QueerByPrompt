/* Research data and scoring. Identity words describe prompt inputs, never
   visually verifiable identities. Keep scoring independent from those inputs. */
const BlindGuess = (() => {
  'use strict';
  const keyword = (word, type) => ({ word, type });
  const v = word => keyword(word, 'visible');
  const a = word => keyword(word, 'assumption');
  const n = word => keyword(word, 'unsupported');
  const i = word => keyword(word, 'interpretation');
  // Order mixes categories, so position never gives away a keyword's treatment.
  const rounds = [
    {
      image: 'assets/images/blind-guess-1.png',
      alt: 'Portrait of a young East Asian adult with medium-length dark hair wearing a dark jacket over a white top.',
      keywords: [a('straight'), v('young'), v('medium hair'), i('masculine'), a('lesbian'), v('casual clothing'), n('older'), v('approachable'), a('non-binary'), v('feminine'), n('short hair'), i('androgynous')],
      feedback: 'Some of your choices matched visible features, but others relied on assumptions about identity. Sexual orientation cannot be confirmed from appearance alone.',
      note: 'A neutral or slightly masculine style can still be read through stereotypes about sexuality or gender expression.',
      prompt: 'A realistic waist-up portrait of a young East Asian adult person, shown alone and centered. The person has a calm, approachable expression and medium-length hair. She should read as a straight young woman, with a clearly feminine overall appearance, but wearing simple everyday clothing in a slightly masculine or gender-neutral style, such as a loose shirt, plain jacket, or relaxed dark top. Keep the styling natural, ordinary, and not exaggerated. Use soft natural lighting and a minimal, blurred background so the focus stays on the face, hair, clothing, and overall appearance. Documentary photography style. No text.'
    },
    {
      image: 'assets/images/blind-guess-2.png',
      alt: 'Portrait of a middle-aged Black adult with short hair wearing a dark casual jacket.',
      keywords: [a('lesbian'), v('confident'), v('short hair'), a('straight'), v('middle-aged'), v('casual clothing'), n('young'), v('masculine-presenting'), a('gay man'), i('feminine-presenting'), n('long hair'), a('parent')],
      feedback: 'The original AI prompt used the word “lesbian”, but the image itself does not prove this identity. If you selected “lesbian”, you may have been responding to visual cues that AI also associates with that label.',
      note: 'This is where model bias and human visual assumptions can begin to overlap.',
      prompt: 'A realistic portrait photo of a middle-aged lesbian. Show one person only. Focus on the person’s appearance from the waist up. The person is Black or brown-skinned, with short hair and a confident but natural expression. She wears casual everyday clothing with a slightly masculine-presenting style, such as a simple jacket or plain dark T-shirt, but avoid exaggerated stereotypes or theatrical styling. Use soft natural lighting and a minimal, blurred background so the viewer focuses on the face, hairstyle, clothing, and overall presentation. Documentary photography style. No text.'
    },
    {
      image: 'assets/images/blind-guess-3.png',
      alt: 'Portrait of an older adult with short silver hair wearing a dark jacket over a light shirt.',
      keywords: [a('non-binary'), v('calm'), v('silver hair'), i('masculine'), a('lesbian'), v('refined'), n('young'), v('older'), a('straight'), v('androgynous'), i('casual clothing'), a('artist')],
      feedback: 'The AI was prompted to generate a non-binary person, but non-binary identity has no single visible appearance. The image reflects how the model chose to translate an abstract identity into visual cues.',
      note: 'Age, hairstyle, and presentation may affect what users expect a non-binary person to look like.',
      prompt: 'A realistic waist-up portrait of an older non-binary person, shown alone in the foreground and centered. The person has grey or silver hair, a calm and refined presence, and a balanced mix of masculine and feminine visual cues. They wear simple but stylish everyday clothing, such as a neat shirt, soft jacket, or subtle accessories, without looking costume-like or overly alternative. In the far background, include a very subtle and blurred suggestion of a family group, but keep the main subject clearly dominant in the frame. Use soft natural lighting and a minimal, blurred background so the focus stays on the face, hair, clothing, and overall appearance. Documentary photography style. No text.'
    }
  ];
  const categories = {
    visible: { label: 'Visible', points: 2, explanation: 'Supported by the visible cues used in this activity.' },
    assumption: { label: 'Assumption', points: 0, explanation: 'This cannot be confirmed from appearance alone.' },
    unsupported: { label: 'Not supported', points: -1, explanation: 'This description is not supported by the visible features in this image.' },
    interpretation: { label: 'Interpretation', points: 0, explanation: 'A subjective reading of presentation.' }
  };
  function scoreRound(round, selection) {
    const points = [...new Set(selection)].reduce((sum, word) => {
      const item = round.keywords.find(item => item.word === word);
      return sum + (item ? categories[item.type].points : 0);
    }, 0);
    return Math.max(0, Math.min(10, points));
  }
  function reflection(score) {
    if (score <= 10) return {
      band: 'low', title: 'Your judgements rely heavily on speculation.',
      text: 'Many of your choices involve identities or personal backgrounds that cannot be confirmed by outward appearances. AI also frequently makes similar visual associations when generating images from identity-related terms.'
    };
    if (score <= 20) return {
      band: 'middle', title: 'Some of your judgements are based on visible characteristics, but there is still some speculation.',
      text: 'You have noticed certain characteristics that can be directly observed, whilst also linking some physical traits to identity. Stereotypes often form precisely from these vague associations.'
    };
    return {
      band: 'high', title: 'Most of your choices are based on information that can be directly observed.',
      text: 'However, appearances alone cannot fully define a person’s identity. At the same time, the images you see have already been influenced by AI’s understanding of identity terms such as ‘lesbian’ and ‘non-binary’.'
    };
  }
  return { rounds, categories, scoreRound, reflection };
})();
