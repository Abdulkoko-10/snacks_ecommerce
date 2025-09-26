// A simple feature flag manager that reads from environment variables.
// Vercel environment variables can be used to toggle features in different environments (preview, production).

// To enable a feature, set the corresponding environment variable to "1", "true", or "on".
const isFeatureEnabled = (featureName) => {
  const flag = process.env[`NEXT_PUBLIC_FLAG_${featureName}`]?.toLowerCase();
  return flag === '1' || flag === 'true' || flag === 'on';
};

export const FLAGS = {
  USE_ORCHESTRATOR: 'USE_ORCHESTRATOR',
  USE_ORCHESTRATOR_CHAT: 'USE_ORCHESTRATOR_CHAT',
};

export const isOrchestratorEnabled = () => isFeatureEnabled(FLAGS.USE_ORCHESTRATOR);
export const isOrchestratorChatEnabled = () => isFeatureEnabled(FLAGS.USE_ORCHESTRATOR_CHAT);