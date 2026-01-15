import { Link } from 'react-router-dom'
import { HeroWithFloatingVideo } from '../components/HeroWithFloatingVideo'
import { FeatureCard } from '../components/FeatureCard'
import { TaglineBanner } from '../components/TaglineBanner'
import { FeatureShowcase } from '../components/FeatureShowcase'

export function HomePage() {
  return (
    <>
      <HeroWithFloatingVideo
        youtubeVideoId="CNUJpwsbtIQ"
        floatingVideoUrl="https://www.youtube.com/watch?v=Fq6h5uhq4NQ"
      >
        <div className="w-full max-w-4xl text-center space-y-4 px-4 sm:space-y-6 drop-shadow-lg">
          <h1 className="text-3xl font-bold text-white drop-shadow-lg sm:text-4xl md:text-5xl lg:text-6xl">
            All you need is a{' '}
            <span className="text-green-400 drop-shadow-lg">'what if...'</span>
          </h1>
          <p className="text-base text-white/90 drop-shadow-md sm:text-lg md:text-xl lg:text-2xl">
            Turn your ideas into reality with FundedYouth
          </p>
          <Link
            to="/classes"
            className="inline-block px-6 py-2.5 bg-blue-600 text-white text-sm rounded-full font-semibold hover:bg-blue-700 transition-colors sm:px-8 sm:py-3 sm:text-base drop-shadow-lg"
          >
            Get Started
          </Link>
        </div>
      </HeroWithFloatingVideo>

      {/* Next Section - Much more padding on desktop for overlapping card */}
      <section className="relative bg-white pt-8 lg:pt-80 pb-20 px-4 xl:pt-96">
        <div className="container mx-auto max-w-4xl">
          {/* Mission Statement as Quote */}
          <blockquote className="relative mb-10">
            {/* Opening Quote Mark */}
            <span className="absolute -top-4 -left-2 sm:-left-4 text-6xl sm:text-7xl text-blue-600/20 font-serif leading-none">
              &quot;
            </span>

            <p className="text-xl sm:text-2xl text-gray-800 text-center leading-relaxed italic px-8 sm:px-12">
              Our mission at FundedYouth is to solve for limited resources in
              education by empowering our youth with access to industrial
              manufacturing tools, STEAM educational services, and on-demand
              manufacturing certification programs.
            </p>

            {/* Closing Quote Mark */}
            <span className="absolute -bottom-8 -right-2 sm:-right-4 text-6xl sm:text-7xl text-blue-600/20 font-serif leading-none">
              "
            </span>
          </blockquote>

          {/* Call-to-Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-16">
            <Link
              to="/volunteer"
              className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
            >
              Get Involved
            </Link>
            <Link
              to="/impact"
              className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition-colors shadow-md hover:shadow-lg"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      {/* <section className="relative bg-gray-50 py-20 px-4"> */}
        {/* <div className="container mx-auto max-w-6xl"> */}
          {/* Grid of Feature Cards */}
          {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-8"> */}

            {/* Feature 1: Memberships */}
            {/* <FeatureCard
              icon={
                <img
                  src="/assets/images/credit-v2.png"
                  alt="Memberships"
                  className="w-full h-full object-cover rounded-lg"
                />
              }
              title="Memberships"
              description="Get monthly benefits including credits and covered classes. Unlock exclusive access to tools, resources, and learning opportunities."
              linkText="View Plans"
              linkHref="/memberships"
            /> */}

            {/* Feature 2: Classes */}
            {/* <FeatureCard
              icon={
                <img
                  src="/assets/images/class-v1.png"
                  alt="Classes"
                  className="w-full h-full object-cover rounded-lg"
                />
              }
              title="Classes"
              description="Learn 3D printing, 3D modeling, coding, on-demand manufacturing, and more. Hands-on instruction from industry experts."
              linkText="Explore Classes"
              linkHref="/classes"
            /> */}

            {/* Feature 3: Makerspace */}
            {/* <FeatureCard
              icon={
                <img
                  src="/assets/images/prototype-v1.png"
                  alt="Makerspace"
                  className="w-full h-full object-cover rounded-lg"
                />
              }
              title="Makerspace"
              description="Community space with open labs. Imagine, design, and produce it. Access industrial tools and collaborate with fellow makers."
              linkText="Visit Makerspace"
              linkHref="/contact"
            />
          </div> */}
        {/* </div> */}
      {/* </section> */}

      {/* Tagline Banner Section */}
      <TaglineBanner backgroundImage="/assets/images/tagline-bg-soldering.png">
        <p className="text-2xl sm:text-3xl md:text-1xl lg:text-1xl leading-tight">
          Empowering{' '}
          <span className="font-extrabold">youth with the tools,</span> skills,
          and maker spaces they need to turn creativity into{' '}
          <span className="font-extrabold">real-world innovation.</span>
        </p>
      </TaglineBanner>

      {/* Info Section */}
      <section className="relative bg-white py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          {/* Heading */}
          <h2 className="text-3xl sm:text-3xl lg:text-4xl font-bold text-blue-800 mb-6">
            Concept to Creation in Every Lesson
          </h2>

          {/* Description */}
          <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
            Here at FundedYouth, we engage students with immersive,
            skill-building activities that ignite curiosity and open doors to
            future STEM opportunities.
          </p>
        </div>
      </section>

      <FeatureShowcase
        eyebrow="Mechanical Development"
        title="3D Printing | 3D Modeling | LaserCrafting"
        description="Experience hands-on mechanical development as you design, print, and craft your own creations with 3D printers, modeling tools, and laser cutters—there's always something exciting to build here."
        buttonText="Register today"
        buttonHref="/classes"
        mediaType="video"
        mediaSrc="/assets/video/making-a-sword.mp4"
        videoThumbnail="/assets/images/making-a-sword-video-cover.png"
        videoAutoPlayCount={3}
      />

      <FeatureShowcase
        eyebrow="Integrated Development"
        title="Coding | Electronics | AI Integration"
        description="Learn how coding, electronics, and AI work as one system through guided projects that help you design, build, and understand technology in a deeper way."
        buttonText="Learn to code"
        buttonHref="/classes"
        mediaType="video"
        mediaSrc="/assets/video/countdown.mp4"
        videoThumbnail="/assets/images/countdown-video-cover.png"
        videoAutoPlayCount={3}
        titleColor="text-green-600"
        buttonColor="bg-green-600"
      />


      <FeatureShowcase
        eyebrow="Community Mentorships"
        title="Professional 1-on-1 Training"
        description="Learn alongside mentors who encourage your growth, expand your understanding of new technologies, and help you build a portfolio that stands out in the future."
        buttonText="Book a Session"
        buttonHref="/classes"
        mediaType="image"
        mediaSrc="/assets/images/classroom-tutoring-v1.png"
        titleColor="text-orange-400"
        buttonColor="bg-orange-400"
      />

      {/* First Tech Challenge  */}
      <FeatureShowcase
        eyebrow="First Inspires"
        title="First Tech Challenge"
        description="FundedYouth is a proud supporter of the FIRST® Tech Challenge, providing hands-on support to teams like Rusteze Robotics. Our community makerspace offers a collaborative environment with 3D printing, computers, and more, giving teams the tools they need to design, build, and compete."
        buttonText="Visit Makerspace"
        buttonHref="/contact"
        mediaType="image"
        mediaSrc="/assets/images/rusteze-robotics-2025-26.png"
        backgroundColor="bg-gray-50"
        imagePosition="left"
        titleColor="text-red-600"
        buttonColor="bg-red-600"
      />

      {/* Tagline Banner Section */}
      <TaglineBanner
        backgroundImage="/assets/images/tagline-bg-classroom.png"
        overlayColor="rgba(0, 150, 137, .8)"
      >
        <p className="text-2xl sm:text-3xl md:text-1xl lg:text-1xl leading-tight italic">
          Supporting <span className="font-bold">teachers</span> with tools and
          spaces that{' '}
          <span className="font-bold">"transform student creativity"</span> into
          real impact.
        </p>
      </TaglineBanner>

      {/* Info Section */}
      <section className="relative bg-white py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          {/* Heading */}
          <h2 className="text-3xl sm:text-3xl lg:text-4xl font-bold text-teal-600 mb-6">
            In the Classroom
          </h2>

          {/* Description */}
          <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
            We make technology integration effortless for teachers. Our team provides on-campus instruction during school hours, so educators can learn new tools without spending their own time or money. Students receive smooth onboarding and supported certifications through FundedYouth facilities, while teachers gain real instructional support—not just curriculum.
          </p>

          {/* Button */}
          <Link
            to="/teachers"
            className="inline-block px-8 py-3 mt-8 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors shadow-md hover:shadow-lg"
          >
            Get Started
          </Link>
        </div>
      </section>
    </>
  );
}
