import {
  Bug,
  Sparkles,
  Wrench,
  Search,
  CircleAlert
} from "lucide-react";

export const getTicketTypeMeta = (type) => {
  const ticketTypes = {
    Bug: {
      label: "Bug",
      Icon: Bug
    },

    Feature: {
      label: "Feature",
      Icon: Sparkles
    },

    Change: {
      label: "Change",
      Icon: Wrench
    },

    Investigation: {
      label: "Investigation",
      Icon: Search
    }
  };

  return (
    ticketTypes[type] || {
      label: type || "Unknown",
      Icon: CircleAlert
    }
  );
};

export const getPriorityClass = (priority) => {
  return `priority-badge priority-${String(
    priority
  )
    .toLowerCase()
    .replaceAll(" ", "-")}`;
};