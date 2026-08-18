function calculateReadiness(data) {
  const requirements = {
    description: data.has_description,
    stepsToReproduce: data.has_steps_to_reproduce,
    expectedBehaviour: data.has_expected_behaviour,
    actualBehaviour: data.has_actual_behaviour,
    environment: data.has_environment,
    acceptanceCriteria: data.has_acceptance_criteria,
    priority: data.has_priority
  };

  const requirementNames = {
    description: "Description",
    stepsToReproduce: "Steps to reproduce",
    expectedBehaviour: "Expected behaviour",
    actualBehaviour: "Actual behaviour",
    environment: "Environment",
    acceptanceCriteria: "Acceptance criteria",
    priority: "Priority"
  };

  const totalRequirements = Object.keys(requirements).length;

  const completedRequirements =
    Object.values(requirements).filter(Boolean).length;

  const score = Math.round(
    (completedRequirements / totalRequirements) * 100
  );

  const missingRequirements = Object.entries(requirements)
    .filter(([, value]) => !value)
    .map(([key]) => requirementNames[key]);

  const status =
    missingRequirements.length === 0 ? "READY" : "NOT READY";

  return {
    score,
    status,
    missingRequirements
  };
}

module.exports = {
  calculateReadiness
};