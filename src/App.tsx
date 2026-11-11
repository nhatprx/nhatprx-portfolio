import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Skills from './components/Skills'
import Projects from './components/Projects'
import Experience from './components/Experience'
import Contact from './components/Contact'
import Footer from './components/Footer'
import { portfolioData } from './data/portfolioData'

export default function App() {
  const { personal, skills, projects, experience } = portfolioData

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      <Navbar
        name={personal.name}
        github={personal.github}
        email={personal.email}
      />

      <main className="flex-1">
        <Hero
          name={personal.name}
          role={personal.role}
          tagline={personal.tagline}
          status={personal.status}
        />

        <About />

        <Skills skills={skills} />

        <Projects projects={projects} />

        <Experience experience={experience} />

        <Contact
          email={personal.email}
          github={personal.github}
          linkedin={personal.linkedin}
        />
      </main>

      <Footer name={personal.name} />
    </div>
  )
}
