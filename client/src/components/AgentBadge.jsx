// Colored pill; color is derived deterministically from the company name.
function hue(str = '') {
  let h = 0;
  for (const ch of str) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return h;
}

export default function AgentBadge({ company, name }) {
  const h = hue(company);
  return (
    <span
      className="badge"
      title={name || company}
      style={{ background: `hsl(${h} 70% 92%)`, color: `hsl(${h} 60% 28%)`, borderColor: `hsl(${h} 50% 75%)` }}
    >
      {company}
    </span>
  );
}
