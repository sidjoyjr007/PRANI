import { useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, Shield, Zap, Layers, Cpu, Code2, PlayCircle, Network, ServerCrash, Key, Box, Target } from "lucide-react"
import praniLogo from '@/assets/only-logo.svg'

function useScrollReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in-up');
          entry.target.classList.remove('opacity-0', 'translate-y-8');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return ref;
}

function RevealSection({ children, className = "", delayClass = "" }) {
  const ref = useScrollReveal();
  return (
    <div ref={ref} className={`opacity-0 translate-y-8 transition-all duration-700 ${className} ${delayClass}`}>
      {children}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background relative flex flex-col selection:bg-primary/20 selection:text-foreground text-foreground font-sans overflow-x-hidden">
      
      {/* Premium Grid Background */}
      <div className="absolute inset-0 bg-grid-black dark:bg-grid-white [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_80%,transparent)] pointer-events-none -z-20" />
      
      {/* Immersive Background Glows */}
      <div className="absolute top-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-20%] left-[20%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[150px] animate-pulse-glow" style={{ animationDuration: '10s' }} />
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDuration: '15s', animationDelay: '2s' }} />
      </div>
      
      {/* Floating Nano Navigation */}
      <div className="w-full flex justify-center py-6 px-4 sticky top-0 z-50 transition-all duration-300">
        <nav className="bg-background/70 backdrop-blur-2xl border border-border/50 rounded-full px-4 md:px-6 py-3 flex items-center justify-between shadow-2xl shadow-black/5 w-full max-w-5xl">
          <div className="flex items-center gap-3 animate-fade-in-up">
            <img 
              src={praniLogo} 
              alt="Prani Logo" 
              className="w-8 h-8 md:w-9 md:h-9 drop-shadow-md"
            />
          </div>
          
          <div className="hidden md:flex flex-1 justify-center items-center gap-8 animate-fade-in-up-delayed-1 text-sm font-medium tracking-wide">
            <a href="#flow" className="text-muted-foreground hover:text-foreground transition-colors mix-blend-difference">How it Works</a>
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors mix-blend-difference">Features</a>
          </div>

          <div className="flex items-center gap-3 animate-fade-in-up-delayed-2">
            <Link to="/login">
              <Button variant="ghost" className="hidden sm:flex rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all font-medium h-9 px-4 text-sm">
                Sign In
              </Button>
            </Link>
            <Link to="/signup">
              <Button className="h-9 px-5 rounded-full shadow-lg hover:shadow-primary/20 transition-all relative overflow-hidden bg-foreground text-background hover:bg-foreground/90 hover:-translate-y-0.5 font-semibold text-sm">
                Get Started
              </Button>
            </Link>
          </div>
        </nav>
      </div>

      <main className="flex-1 flex flex-col z-10 w-full">
        
        {/* Vercel-style Hero Section */}
        <section className="container mx-auto px-4 pt-16 md:pt-28 pb-24 text-center max-w-6xl relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-muted/40 border border-border/60 mb-8 backdrop-blur-md animate-fade-in-up shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-xs md:text-sm font-medium tracking-wide text-muted-foreground">Prani v1.0 is now available</span>
            <ArrowRight className="w-3 h-3 text-muted-foreground" />
          </div>
          
          <h1 className="animate-fade-in-up-delayed-1 text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[1.05] text-foreground mix-blend-hard-light drop-shadow-sm">
            Autonomous Agents. <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-foreground via-foreground/80 to-muted-foreground">
              Built for Scale.
            </span>
          </h1>
          
          <p className="animate-fade-in-up-delayed-2 text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed font-light tracking-tight">
            The complete infrastructure to deploy, monitor, and scale LLM-powered agents with native Model Context Protocol (MCP) support.
          </p>
          
          <div className="animate-fade-in-up-delayed-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup" className="w-full sm:w-auto">
              <Button size="lg" className="h-14 px-8 text-base md:text-lg rounded-full shadow-[0_0_40px_-10px_rgba(59,130,246,0.4)] hover:shadow-[0_0_60px_-15px_rgba(59,130,246,0.6)] transition-all hover:-translate-y-1 relative group w-full sm:w-auto overflow-hidden bg-foreground text-background hover:bg-foreground/90 font-semibold border border-transparent dark:border-white/10">
                <span className="relative z-10 flex items-center">
                  Start Building Now
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </Link>
            <Link to="/login" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="h-14 px-8 text-base md:text-lg rounded-full hover:bg-muted/50 transition-all hover:-translate-y-1 border-border/60 backdrop-blur-sm group w-full sm:w-auto text-foreground shadow-sm">
                <PlayCircle className="mr-2 w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                View Dashboard
              </Button>
            </Link>
          </div>
        </section>

        {/* Console / Terminal Section (Linear style subtle preview) */}
        <section className="container mx-auto px-4 pb-32 max-w-5xl relative z-20">
          <RevealSection className="rounded-2xl md:rounded-[2rem] border border-border/50 bg-[#0A0A0A] shadow-2xl overflow-hidden relative">
             <div className="absolute top-0 w-full h-12 border-b border-border/20 bg-background/5 flex items-center px-4 gap-2 justify-between">
               <div className="flex gap-2">
                 <div className="w-3 h-3 rounded-full bg-red-500/40" />
                 <div className="w-3 h-3 rounded-full bg-yellow-500/40" />
                 <div className="w-3 h-3 rounded-full bg-green-500/40" />
               </div>
               <div className="text-xs font-mono text-muted-foreground/50">agent-runtime-v1</div>
               <div className="w-10"></div>
             </div>
             <div className="p-6 md:p-10 font-mono text-sm md:text-base text-muted-foreground/80 overflow-x-auto">
               <div className="flex gap-4 opacity-50"><span className="text-blue-500">→</span><span>[System] Initializing Prani Workspace...</span></div>
               <div className="flex gap-4 opacity-70"><span className="text-blue-500">→</span><span>[System] Loading MCP Server: internal-db-connector</span></div>
               <div className="flex gap-4"><span className="text-green-500">✓</span><span className="text-foreground">Tools loaded successfully (Search, DB Query, Calculator)</span></div>
               <div className="h-4"></div>
               <div className="flex gap-4"><span className="text-purple-500">Agent</span><span className="text-foreground font-medium">I need to check the user table to verify the auth issue.</span></div>
               <div className="flex gap-4"><span className="text-blue-500 text-xs mt-1">⚡</span><span className="text-blue-400">Executing tool [db_query] with args: "SELECT * FROM users..."</span></div>
             </div>
             {/* Glow overlay */}
             <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
          </RevealSection>
        </section>

        {/* Flow Section */}
        <section id="flow" className="container mx-auto px-4 py-24 relative z-10 text-center">
          <RevealSection className="mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tighter">The Agent Lifecycle</h2>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto font-light tracking-tight">
              A continuous, frictionless loop from tool integration to autonomous execution.
            </p>
          </RevealSection>

          <RevealSection className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12">
            {/* Step 1 */}
            <div className="flex flex-col items-center bg-card/60 backdrop-blur-xl border border-border/50 p-6 rounded-3xl w-72 shadow-xl relative group">
              <div className="absolute -top-4 -right-4 w-8 h-8 rounded-full bg-foreground text-background font-bold flex items-center justify-center text-sm shadow-md">1</div>
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                <Box className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold mb-2">Define Capabilities</h3>
              <p className="text-sm text-muted-foreground">Attach custom Python tools and native MCP servers to your workspace to give agents real-world skills.</p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center bg-card/60 backdrop-blur-xl border border-border/50 p-6 rounded-3xl w-72 shadow-xl relative group">
              <div className="absolute -top-4 -right-4 w-8 h-8 rounded-full bg-foreground text-background font-bold flex items-center justify-center text-sm shadow-md">2</div>
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-4 group-hover:scale-110 transition-transform">
                <Target className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold mb-2">Configure Agent</h3>
              <p className="text-sm text-muted-foreground">Select an underlying LLM, provide specialized instructions, and tailor the agent's exact behavior.</p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center bg-card/60 backdrop-blur-xl border border-border/50 p-6 rounded-3xl w-72 shadow-xl relative group">
              <div className="absolute -top-4 -right-4 w-8 h-8 rounded-full bg-foreground text-background font-bold flex items-center justify-center text-sm shadow-md">3</div>
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 mb-4 group-hover:scale-110 transition-transform cursor-pointer">
                <PlayCircle className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold mb-2">Execute & Scale</h3>
              <p className="text-sm text-muted-foreground">Run complex dynamic tasks while monitoring execution traces and thoughts in real-time.</p>
            </div>
          </RevealSection>
        </section>

        {/* Premium Bento Grid Features */}
        <section id="features" className="container mx-auto px-4 py-32 relative text-left">
          <RevealSection className="mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tighter">Everything to run AI in production.</h2>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl text-left font-light tracking-tight">
              A comprehensive toolkit engineered to provide complete control over LLM execution, tool integration, and observability.
            </p>
          </RevealSection>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 auto-rows-[300px] md:auto-rows-[350px]">
            
            {/* Bento 1: Context Management (Large) */}
            <RevealSection className="md:col-span-2 md:row-span-2 group relative overflow-hidden rounded-[2rem] bg-card/10 backdrop-blur-xl border border-border/60 hover:border-border transition-colors hover:bg-card/30 flex flex-col gap-6 p-8 md:p-10">
              <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-purple-500/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="w-14 h-14 rounded-2xl bg-muted/50 border border-border/60 flex items-center justify-center text-foreground group-hover:scale-105 transition-transform duration-500 shrink-0">
                <Layers className="w-6 h-6" />
              </div>
              <div className="flex-1 mt-auto z-10">
                <h3 className="text-2xl md:text-3xl font-bold mb-3 tracking-tight">Autonomous Orchestration</h3>
                <p className="text-muted-foreground text-lg leading-relaxed font-light">
                  Prani's execution engine intelligently manages context windows, breaks down complex goals into actionable multi-step plans, and self-corrects during execution to ensure your tasks are completed reliably.
                </p>
              </div>
              
              {/* Abstract visual graphic inside the card */}
              <div className="absolute -right-20 -bottom-20 w-80 h-80 border border-border/30 rounded-full flex items-center justify-center opacity-20 group-hover:opacity-40 transition-opacity">
                <div className="w-60 h-60 border border-border/30 rounded-full flex items-center justify-center">
                  <div className="w-40 h-40 border border-border/30 rounded-full" />
                </div>
              </div>
            </RevealSection>

            {/* Bento 2: Model Agnostic (Square) */}
            <RevealSection className="md:col-span-2 group relative overflow-hidden rounded-[2rem] bg-card/10 backdrop-blur-xl border border-border/60 hover:border-border transition-colors hover:bg-card/30 p-8 flex flex-col justify-between" delayClass="[animation-delay:100ms]">
               <div className="flex justify-between items-start">
                 <div className="w-12 h-12 rounded-2xl bg-muted/50 border border-border/60 flex items-center justify-center text-foreground group-hover:scale-105 transition-transform duration-500">
                   <Network className="w-5 h-5" />
                 </div>
               </div>
               <div>
                <h3 className="text-2xl font-bold mb-2 tracking-tight">Native MCP Integration</h3>
                <p className="text-muted-foreground font-light text-base leading-relaxed">
                  Support for the Model Context Protocol. Seamlessly inject specialized logic, databases, and APIs directly into your LLM reasoning pipelines.
                </p>
               </div>
            </RevealSection>

            {/* Bento 3: Custom Tooling (Square) */}
            <RevealSection className="md:col-span-1 group relative overflow-hidden rounded-[2rem] bg-card/10 backdrop-blur-xl border border-border/60 hover:border-border transition-colors hover:bg-card/30 p-8 flex flex-col justify-between" delayClass="[animation-delay:200ms]">
              <div className="w-12 h-12 rounded-2xl bg-muted/50 border border-border/60 flex items-center justify-center text-foreground group-hover:scale-105 transition-transform duration-500">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2 tracking-tight">Model Agnostic</h3>
                <p className="text-muted-foreground font-light text-base leading-relaxed">
                  Switch effortlessly between OpenAI, Anthropic, Gemini, or local models. Stop worrying about provider lock-in.
                </p>
               </div>
            </RevealSection>

            {/* Bento 4: Secure Workspaces (Square) */}
            <RevealSection className="md:col-span-1 group relative overflow-hidden rounded-[2rem] bg-card/10 backdrop-blur-xl border border-border/60 hover:border-border transition-colors hover:bg-card/30 p-8 flex flex-col justify-between" delayClass="[animation-delay:300ms]">
               <div className="w-12 h-12 rounded-2xl bg-muted/50 border border-border/60 flex items-center justify-center text-foreground group-hover:scale-105 transition-transform duration-500">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2 tracking-tight">Secure Environment</h3>
                <p className="text-muted-foreground font-light text-base leading-relaxed">
                  Role-based access, securely encrypted secret management, and sandboxed execution.
                </p>
               </div>
            </RevealSection>

          </div>
        </section>

        {/* Final Heavy Call To Action */}
        <section className="py-24 relative border-t border-border/40 bg-foreground text-background">
          <div className="absolute inset-0 bg-grid-white opacity-20 [mask-image:linear-gradient(to_bottom,transparent,black,transparent)] pointer-events-none" />
          <div className="container mx-auto px-4 max-w-4xl text-center relative z-10">
            <RevealSection>
              <h2 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter mix-blend-difference">
                Deploy your first agent today.
              </h2>
              <p className="text-xl md:text-2xl opacity-70 mb-12 max-w-2xl mx-auto font-light tracking-tight">
                No credit card required. Start building robust, scaleable autonomous systems in minutes.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/signup" className="w-full sm:w-auto">
                  <Button size="lg" className="h-14 px-10 text-lg rounded-full shadow-2xl hover:scale-105 transition-all w-full sm:w-auto bg-background text-foreground hover:bg-background/90 font-semibold">
                    Start Building Free
                  </Button>
                </Link>
                <Link to="#" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full hover:bg-white/10 transition-all border-white/20 text-white w-full sm:w-auto">
                    View Documentation
                  </Button>
                </Link>
              </div>
            </RevealSection>
          </div>
        </section>

      </main>

      {/* Ultra Minimalist Footer */}
      <footer className="border-t border-border/20 bg-background py-8 relative z-10">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-muted-foreground text-sm">
            <div className="flex items-center gap-2">
               <img src={praniLogo} alt="Prani Logo" className="w-5 h-5 opacity-60 grayscale" />
               <p>© {new Date().getFullYear()} Prani Inc.</p>
            </div>
            
            <div className="flex gap-6">
               <a href="#" className="hover:text-foreground transition-colors font-medium">Docs</a>
               <a href="#" className="hover:text-foreground transition-colors font-medium">Github</a>
               <a href="#" className="hover:text-foreground transition-colors font-medium">Twitter</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
