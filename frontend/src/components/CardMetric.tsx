type Props = {
  title: string;
  value: string | number;
};

export default function CardMetric({
  title,
  value,
}: Props) {
  return (
    <div
      style={{
        background: "#1e1e1e",
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
      }}
    >
      <h3>{title}</h3>

      <h2
        style={{
          color: "#ffffff",
          marginTop: "10px",
          fontSize: "2rem",
        }}
      >
        {value}
      </h2>
    </div>
  );
}