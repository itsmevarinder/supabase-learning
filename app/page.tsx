import Header from "@/components/shadn/header";
import HeroSection from "@/components/shadn/HeroSection";
import TrustedBy from "@/components/shadn/TrustedBy";
import AboutSection from "@/components/shadn/AboutSection";
import VideoSection from "@/components/shadn/VideoSection";
import PortfolioSection from "@/components/shadn/PortfolioSection";
import FAQSection from "@/components/shadn/Accordion";
import PricingSection from "@/components/shadn/PricingSection";
import TestimonialSection from "@/components/shadn/TestimonialSection";
import ContactSection from "@/components/shadn/Contact";
import CtaBanner from "@/components/shadn/CtaBanner";
import Footer from "@/components/shadn/footer";
import ScrollFlipBackground from "@/components/shadn/ScrollFlipBackground";
import { getAboutSection, getFaqs, getHeroBanners, getPortfolioProjects, getPricingPlans, getSiteSettings, getTestimonials, getVideoSection } from "@/lib/supabase/server";

const Page = async () => {
   const [heroBanners, portfolioProjects, pricingPlans, siteSettings, testimonials, faqs, aboutSection, videoSection] = await Promise.all([
      getHeroBanners(),
      getPortfolioProjects(),
      getPricingPlans(),
      getSiteSettings(),
      getTestimonials(),
      getFaqs(),
      getAboutSection(),
      getVideoSection(),
   ]);

   return (
      <main className="overflow-x-clip">
         <ScrollFlipBackground />
         <Header showLoginButton={siteSettings?.show_login_button ?? true} />
         <HeroSection banners={heroBanners} />
         <TrustedBy />
         <AboutSection about={aboutSection} />
         <PortfolioSection projects={portfolioProjects} />
         <FAQSection faqs={faqs} />
         <PricingSection plans={pricingPlans} />
         <TestimonialSection testimonials={testimonials} />
         <VideoSection video={videoSection} />
         <ContactSection settings={siteSettings} />
         <CtaBanner />
         <Footer settings={siteSettings} />
      </main>
   );
};

export default Page;