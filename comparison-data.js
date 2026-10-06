/* Local, pre-generated image pairs. Both images always share age and relationship. */
const PromptComparison = (() => {
  'use strict';
  const identities = [
    { value: 'gay', label: 'Gay' },
    { value: 'lesbian', label: 'Lesbian' },
    { value: 'non-binary', label: 'Non-binary' },
    { value: 'transgender', label: 'Transgender' }
  ];
  const ages = [
    { value: 'young', label: 'Young' },
    { value: 'middle', label: 'Middle-aged' },
    { value: 'old', label: 'Older' }
  ];
  const relationships = [
    { value: 'single', label: 'Single' },
    { value: 'couple', label: 'Couple' },
    { value: 'family', label: 'Family' }
  ];
  function getPair(identity, age, relationship) {
    const selected = [
      identities.find(option => option.value === identity),
      ages.find(option => option.value === age),
      relationships.find(option => option.value === relationship)
    ];
    if (selected.some(option => !option)) throw new RangeError('Choose a valid identity, age and relationship.');
    return {
      baseline: encodeURI(`assets/comparison/person/person ${age} ${relationship}.png`),
      modified: encodeURI(`assets/comparison/${identity}/${identity} ${age} ${relationship}.png`),
      identity: selected[0].label,
      age: selected[1].label,
      relationship: selected[2].label
    };
  }
  return { identities, ages, relationships, getPair };
})();
