// Client service for calling server-side Gemini endpoints

export async function generateSectionWithAI(params: {
  sectionKey: string;
  sectionTitle: string;
  userPrompt?: string;
  currentContent?: string;
  companyName?: string;
}): Promise<string> {
  const response = await fetch('/api/gemini/generate-section', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || 'Error al comunicarse con el asistente IA.');
  }

  return data.text;
}

export async function enhanceTextWithAI(params: {
  text: string;
  goal?: string;
}): Promise<string> {
  const response = await fetch('/api/gemini/enhance-text', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || 'Error al mejorar el texto con IA.');
  }

  return data.text;
}
