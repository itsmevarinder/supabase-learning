import Header from "@/components/shadn/header";
import HeroSection from "@/components/shadn/HeroSection";
import TrustedBy from "@/components/shadn/TrustedBy";
import AboutSection from "@/components/shadn/AboutSection";
import FeaturesSection from "@/components/shadn/features";
import PortfolioSection from "@/components/shadn/PortfolioSection";
import FAQSection from "@/components/shadn/Accordion";
import WhyChooseUs from "@/components/shadn/WhyChooseUs";
import PricingSection from "@/components/shadn/PricingSection";
import TestimonialSection from "@/components/shadn/TestimonialSection";
import ContactSection from "@/components/shadn/Contact";
import CtaBanner from "@/components/shadn/CtaBanner";
import Footer from "@/components/shadn/footer";
import ScrollFlipBackground from "@/components/shadn/ScrollFlipBackground";
import { getHeroBanners, getPortfolioProjects, getPricingPlans, getSiteSettings, getTestimonials } from "@/lib/supabase/server";

const Page = async () => {
   const [heroBanners, portfolioProjects, pricingPlans, siteSettings, testimonials] = await Promise.all([
      getHeroBanners(),
      getPortfolioProjects(),
      getPricingPlans(),
      getSiteSettings(),
      getTestimonials(),
   ]);

   return (
      <main className="overflow-x-clip">
         <ScrollFlipBackground />
         <Header />
         <HeroSection banners={heroBanners} />
         <TrustedBy />
         <AboutSection />
         {/* <FeaturesSection /> */}
         <PortfolioSection projects={portfolioProjects} />
         <FAQSection />
         {/* <WhyChooseUs /> */}
         <PricingSection plans={pricingPlans} />
         <TestimonialSection testimonials={testimonials} />
         <ContactSection settings={siteSettings} />
         <CtaBanner />
         <Footer settings={siteSettings} />
      </main>
   );
};

export default Page;