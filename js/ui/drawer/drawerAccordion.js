// /js/ui/drawer/drawerAccordion.js

function toggleAccordionGroup(group, trigger, panel, arrow) {
  const isOpen = group.classList.contains("is-open");

  if (isOpen) {
    group.classList.remove("is-open");
    trigger.setAttribute("aria-expanded", "false");
    panel.hidden = true;
    arrow.textContent = "v";
    return;
  }

  group.classList.add("is-open");
  trigger.setAttribute("aria-expanded", "true");
  panel.hidden = false;
  arrow.textContent = "^";
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
  arrow.textContent = defaultOpen ? "^" : "v";

  trigger.appendChild(labelSpan);
  trigger.appendChild(arrow);

  const panel = document.createElement("div");
  panel.className = "mobile-nav-accordion-panel";
  panel.id = `${id}-panel`;
  panel.hidden = !defaultOpen;

  const panelList = document.createElement("div");
  panelList.className = "mobile-nav-accordion-links";

  items.forEach((item) => {
    const link = document.createElement("a");
    link.href = item.href;
    link.id = item.id;
    link.textContent = item.label;
    link.setAttribute("data-link", "");
    panelList.appendChild(link);
  });

  panel.appendChild(panelList);

  if (defaultOpen) {
    group.classList.add("is-open");
  }

  trigger.addEventListener("click", () => {
    toggleAccordionGroup(group, trigger, panel, arrow);
  });

  group.appendChild(trigger);
  group.appendChild(panel);

  return group;
}
