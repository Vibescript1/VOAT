import { useEffect, useState } from "react";

const sections = [
  { id: "home", label: "Home" },
  { id: "updates", label: "Announcements" },
  { id: "jobs", label: "Jobs" },
  { id: "faqs", label: "FAQs" },
  { id: "contact", label: "Contact" },
];

const StickySidebarButtons = () => {
  const [activeSection, setActiveSection] = useState(sections[0].id);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 3;
      
      let current = activeSection;
      for (const section of sections) {
        const el = document.getElementById(section.id);
        if (el) {
          const { top, bottom } = el.getBoundingClientRect();
          const elementTop = top + window.scrollY;
          const elementBottom = bottom + window.scrollY;
          
          if (scrollPosition >= elementTop && scrollPosition < elementBottom) {
            current = section.id;
            break;
          }
        }
      }
      
      if (current !== activeSection) {
        setActiveSection(current);
      }
    };

    const scrollHandler = setTimeout(handleScroll, 100);
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollHandler);
    };
  }, [activeSection]);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      setActiveSection(id);
      el.scrollIntoView({ 
        behavior: "smooth", 
        block: "start" 
      });
    }
  };

  return (
    <aside className="fixed top-16 left-0 w-44 h-[calc(100vh-4rem)] bg-[#f6faff]  flex flex-col justify-center items-center">
      <div className="flex flex-col gap-4 p-4 w-full">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => scrollToSection(section.id)}
            className={`w-full py-2 px-4 rounded-full text-sm font-medium shadow transition-all duration-200 ${
              activeSection === section.id
                ? "bg-[#0B52C0] text-white"
                : "bg-white text-[#0B52C0] border border-[#0B52C0] hover:bg-[#e0efff]"
            }`}
            aria-current={activeSection === section.id ? "page" : undefined}
          >
            {section.label}
          </button>
        ))}
      </div>
    </aside>
  );
};

export default StickySidebarButtons;