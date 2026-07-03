export function PoweredBy() {
  return (
    <div className="flex justify-center items-center py-6 pb-28 opacity-60 hover:opacity-100 transition-opacity">
      <a 
        href="https://veroseven.netlify.app" 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5"
      >
        <span>Powered by</span>
        <span className="font-bold text-slate-700 tracking-wide">VeroSeven</span>
      </a>
    </div>
  )
}
