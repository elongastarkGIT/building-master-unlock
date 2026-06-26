// /js/ui/drawer/drawerAccordion.js

function closeAccordionGroup(group, trigger, arrow) {
  group.classList.remove("is-open");
  trigger.setAttribute("aria-expanded", "false");
  arrow.setAttribute("data-state", "closed");
}

function openAccordionGroup(group, trigger, arrow) {
  group.classList.add("is-open");
  trigger.setAttribute("aria-expanded", "true");
  arrow.setAttribute("data-state", "open");
}

function toggleAccordionGroup(group, trigger, arrow) {
  if (group.classList.contains("is-open")) {
    closeAccordionGroup(group, trigger, arrow);
    return;
  }

  openAccordionGroup(group, trigger, arrow);
}

export function createAccordionGroup({
  id,
  label,
  items = [],
  defaultOpen = false
}) {
  const group = document.createElement("div");
  group.className = "mobile-nav-accordion";
  group.id = id;

  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className = "mobile-nav-accordion-trigger";
  trigger.id = `${id}-trigger`;
  trigger.setAttribute("aria-expanded", defaultOpen ? "true" : "false");
  trigger.setAttribute("aria-controls", `${id}-panel`);

  const labelSpan = document.createElement("span");
  labelSpan.className = "mobile-nav-accordion-label";
  labelSpan.textContent = label;

  const arrow = document.createElement("span");
  arrow.className = "mobile-nav-accordion-arrow";
  arrow.setAttribute("aria-hidden", "true");
  arrow.setAttribute("data-state", defaultOpen ? "open" : "closed");
  arrow.textContent = "v";

  trigger.appendChild(labelSpan);
  trigger.appendChild(arrow);

  const panel = document.createElement("div");
  panel.className = "mobile-nav-accordion-panel";
  panel.id = `${id}-panel`;

  const panelInner = document.createElement("div");
  panelInner.className = "mobile-nav-accordion-panel-inner";

  const panelList = document.createElement("div");
  panelList.className = "mobile-nav-accordion-links";

  items.forEach((item) => {
    const link = document.createElement("a");
    link.href = item.href;
    link.id = item.id;
    link.textContent = item.label;
    link.setAttribute("data-link", "");
    link.tabIndex = defaultOpen ? 0 : -1;
    panelList.appendChild(link);
  });

  panelInner.appendChild(panelList);
  panel.appendChild(panelInner);

  if (defaultOpen) {
    group.classList.add("is-open");
  }

  trigger.addEventListener("click", () => {
    const willOpen = !group.classList.contains("is-open");
    toggleAccordionGroup(group, trigger, arrow);

    panelList.querySelectorAll("a").forEach((link) => {
      link.tabIndex = willOpen ? 0 : -1;
    });
  });

  group.appendChild(trigger);
  group.appendChild(panel);

  return group;
}
