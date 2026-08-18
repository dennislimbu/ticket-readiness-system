function calculateImpact(data) {
  let score = 0;

  const affectedAreas = [];

  if (data.ui_impact) {
    score += 1;
    affectedAreas.push("User Interface");
  }

  if (data.api_impact) {
    score += 2;
    affectedAreas.push("Backend / API");
  }

  if (data.database_impact) {
    score += 3;
    affectedAreas.push("Database");
  }

  if (data.authentication_impact) {
    score += 3;
    affectedAreas.push("Authentication");
  }

  if (data.security_impact) {
    score += 4;
    affectedAreas.push("Security");
  }

  if (data.integration_impact) {
    score += 3;
    affectedAreas.push("External Integration");
  }

  if (data.infrastructure_impact) {
    score += 3;
    affectedAreas.push("Infrastructure");
  }

  if (data.deployment_impact) {
    score += 2;
    affectedAreas.push("Deployment");
  }

  if (data.rollback_complexity === "MEDIUM") {
    score += 1;
  }

  if (data.rollback_complexity === "HIGH") {
    score += 2;
  }

  let impactLevel;

  if (score <= 3) {
    impactLevel = "LOW";
  } else if (score <= 7) {
    impactLevel = "MEDIUM";
  } else if (score <= 12) {
    impactLevel = "HIGH";
  } else {
    impactLevel = "CRITICAL";
  }

  return {
    score,
    impactLevel,
    affectedAreas
  };
}

module.exports = {
  calculateImpact
};