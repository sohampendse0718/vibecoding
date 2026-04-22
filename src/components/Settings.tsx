import { cn } from "../lib/utils";

export default function Settings() {
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="mb-8">
          <h1 className="font-serif text-5xl font-bold tracking-tight text-on-surface">Settings</h1>
          <p className="font-sans text-lg text-on-surface-variant mt-2">Configure operational parameters and AI integration.</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-8">
            <section className="bg-surface-container rounded-xl p-6 md:p-8 border border-surface-bright relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-surface-container-high to-transparent opacity-50 pointer-events-none"></div>
              <h2 className="font-serif text-2xl font-bold text-primary-fixed-dim mb-6 flex items-center gap-3">
                <span className="material-symbols-outlined text-primary-container">store</span>
                Cafe Profile
              </h2>
              <div className="space-y-6 relative z-10">
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                  <div className="w-24 h-24 rounded-full border-2 border-dashed border-outline-variant flex flex-col items-center justify-center text-on-surface-variant hover:border-primary-container hover:text-primary-container cursor-pointer transition-colors shrink-0 bg-surface">
                    <span className="material-symbols-outlined mb-1">upload</span>
                    <span className="text-xs font-semibold">Logo</span>
                  </div>
                  <div className="flex-1 w-full space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-on-surface-variant block mb-1">Business Name</label>
                      <input className="w-full bg-surface border border-outline-variant focus:border-primary-container focus:ring-1 focus:ring-primary-container rounded-lg px-4 py-2.5 font-sans text-base text-on-surface outline-none transition-all placeholder-on-surface-variant/50" type="text" placeholder="Enter business name" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-on-surface-variant block mb-1">Street Address</label>
                  <input className="w-full bg-surface border border-outline-variant focus:border-primary-container focus:ring-1 focus:ring-primary-container rounded-lg px-4 py-2.5 font-sans text-base text-on-surface outline-none transition-all" type="text" placeholder="Enter street address" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-on-surface-variant block mb-1">City</label>
                    <input className="w-full bg-surface border border-outline-variant focus:border-primary-container focus:ring-1 focus:ring-primary-container rounded-lg px-4 py-2.5 font-sans text-base text-on-surface outline-none transition-all" type="text" placeholder="City" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-on-surface-variant block mb-1">Postal Code</label>
                    <input className="w-full bg-surface border border-outline-variant focus:border-primary-container focus:ring-1 focus:ring-primary-container rounded-lg px-4 py-2.5 font-sans text-base text-on-surface outline-none transition-all" type="text" placeholder="Postal code" />
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-surface-container rounded-xl p-6 md:p-8 border border-surface-bright relative">
              <h2 className="font-serif text-2xl font-bold text-primary-fixed-dim mb-6 flex items-center gap-3">
                <span className="material-symbols-outlined text-primary-container">schedule</span>
                Operational Settings
              </h2>
              <div className="space-y-8">
                <div>
                  <h3 className="text-xs font-semibold text-on-surface-variant mb-3 uppercase tracking-wider">Late Night Hours</h3>
                  <div className="flex items-center gap-4 bg-surface p-4 rounded-lg border border-outline-variant/50">
                    <div className="flex-1">
                      <label className="text-xs text-on-surface-variant mb-1 block">Opening</label>
                      <input className="w-full bg-transparent border-none p-0 focus:ring-0 font-sans text-base text-on-surface outline-none" type="time" />
                    </div>
                    <span className="text-on-surface-variant material-symbols-outlined">arrow_right_alt</span>
                    <div className="flex-1">
                      <label className="text-xs text-on-surface-variant mb-1 block">Closing</label>
                      <input className="w-full bg-transparent border-none p-0 focus:ring-0 font-sans text-base text-on-surface outline-none" type="time" />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xs font-semibold text-on-surface-variant mb-3 uppercase tracking-wider">Default Tax Rate</h3>
                    <div className="relative">
                      <input className="w-full bg-surface border border-outline-variant focus:border-primary-container focus:ring-1 focus:ring-primary-container rounded-lg pl-4 pr-8 py-2.5 font-sans text-base text-on-surface outline-none transition-all" step="0.1" type="number" placeholder="0.0" />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant">%</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-on-surface-variant mb-3 uppercase tracking-wider">Accepted Payments</h3>
                    <div className="flex flex-wrap gap-2">
                       {["Credit/Debit", "Digital Wallet", "Crypto"].map((pm, i) => (
                           <label key={i} className="cursor-pointer">
                              <input defaultChecked={i !== 2} className="peer sr-only" type="checkbox" />
                              <div className="px-3 py-1.5 rounded-full border border-outline-variant text-sm font-sans text-on-surface-variant peer-checked:bg-primary-container/10 peer-checked:border-primary-container peer-checked:text-primary-container transition-colors">{pm}</div>
                          </label>
                       ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="lg:col-span-5 space-y-8">
            <section className="bg-surface-container rounded-xl p-6 md:p-8 border border-primary-container/30 relative overflow-hidden shadow-[inset_0_0_20px_rgba(234,179,8,0.05)]">
              <div className="absolute -top-12 -right-12 w-40 h-40 bg-primary-container/10 blur-3xl rounded-full pointer-events-none"></div>
              <h2 className="font-serif text-2xl font-bold text-primary-container mb-6 flex items-center gap-3 relative z-10">
                <span className="material-symbols-outlined">memory</span> AI Assistant Config
              </h2>
              <div className="space-y-6 relative z-10">
                <div className="flex items-center justify-between py-2 border-b border-surface-bright">
                  <div>
                    <div className="font-sans text-base text-on-surface font-semibold">Auto-Suggest Specials</div>
                    <div className="text-xs text-on-surface-variant mt-0.5">Based on weather & time.</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input defaultChecked className="sr-only peer" type="checkbox" />
                    <div className="w-11 h-6 bg-surface-highest border border-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-on-surface after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container peer-checked:border-primary-container"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-surface-bright">
                  <div>
                    <div className="font-sans text-base text-on-surface font-semibold">Inventory Alerts</div>
                    <div className="text-xs text-on-surface-variant mt-0.5">Predictive low-stock warnings.</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input defaultChecked className="sr-only peer" type="checkbox" />
                    <div className="w-11 h-6 bg-surface-highest border border-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-on-surface after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container peer-checked:border-primary-container"></div>
                  </label>
                </div>
                <div className="pt-2">
                  <label className="text-xs font-semibold text-on-surface-variant block mb-3 uppercase tracking-wider">Chat Persona</label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="cursor-pointer group">
                      <input defaultChecked className="peer sr-only" name="persona" type="radio" value="elegant" />
                      <div className="p-3 rounded-lg border border-outline-variant text-center transition-all peer-checked:bg-primary-container/10 peer-checked:border-primary-container group-hover:border-primary-container/50">
                        <div className="font-sans text-base text-on-surface mb-1">Elegant</div>
                        <div className="text-[10px] text-on-surface-variant">Formal & Sophisticated</div>
                      </div>
                    </label>
                    <label className="cursor-pointer group">
                      <input className="peer sr-only" name="persona" type="radio" value="casual" />
                      <div className="p-3 rounded-lg border border-outline-variant text-center transition-all peer-checked:bg-primary-container/10 peer-checked:border-primary-container group-hover:border-primary-container/50">
                        <div className="font-sans text-base text-on-surface mb-1">Casual</div>
                        <div className="text-[10px] text-on-surface-variant">Friendly & Relaxed</div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </section>
            
            <section className="bg-surface-container rounded-xl p-6 md:p-8 border border-surface-bright">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-serif text-2xl font-bold text-primary-fixed-dim flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary-container">groups</span> Staff List
                </h2>
                <button className="text-primary-container text-sm font-semibold hover:underline flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">add</span> Add
                </button>
              </div>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-surface border border-outline-variant/30 text-sm text-on-surface-variant">
                  No staff profiles added yet.
                </div>
              </div>
            </section>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-6 border-t border-surface-bright mt-8">
          <button className="px-6 py-2.5 rounded-lg border border-outline-variant text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors text-xs font-semibold">
            Cancel
          </button>
          <button className="px-6 py-2.5 rounded-lg bg-primary-container text-on-primary-container hover:bg-primary-fixed-dim transition-colors text-xs font-semibold shadow-[0_0_15px_rgba(234,179,8,0.3)] hover:shadow-[0_0_25px_rgba(234,179,8,0.5)]">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
