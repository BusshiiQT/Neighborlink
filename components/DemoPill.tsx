export default function DemoPill() {
  if (String(process.env.NEXT_PUBLIC_DEMO_MODE || process.env.DEMO_MODE).toLowerCase() !== 'true') return null;
  return (
    <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full border border-yellow-400/40 text-yellow-300 bg-yellow-500/10">
      AI demo
    </span>
  );
}
