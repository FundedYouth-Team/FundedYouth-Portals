import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const pathways = [
  {
    icon: (
      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
      </svg>
    ),
    color: "blue",
    title: "Fabrication Specialist",
    description: "Master 3D printing, 3D modeling, and laser cutting. Learn to design, prototype, and manufacture physical objects from concept to creation.",
  },
  {
    icon: (
      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    color: "purple",
    title: "Coding & Integration",
    description: "Build the brain behind your projects. Learn programming, electronics, and how to integrate code with physical hardware for interactive creations.",
  },
  {
    icon: (
      <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    color: "orange",
    title: "Product Development",
    description: "Take your ideas from concept to market-ready product. Learn design thinking, prototyping, iteration, and the full product development lifecycle.",
  },
];

interface EventbriteEvent {
  id: string;
  name: { text: string };
  url: string;
  start: { local: string };
  venue?: {
    name?: string;
    address?: {
      address_1?: string;
      address_2?: string;
    };
  };
  logo?: { url: string };
  ticket_availability?: {
    is_sold_out?: boolean;
    has_available_tickets?: boolean;
    minimum_ticket_price?: { display: string; value: number };
    maximum_ticket_price?: { display: string };
    available_capacity?: number;
  };
}

const EVENTBRITE_ORG_ID = import.meta.env.VITE_EVENTBRITE_ORGANIZATION_ID;

// Helper functions
const formatEventDate = (dateString: string) => {
  const date = new Date(dateString);
  return date;
};

const getMonthAbbr = (dateString: string) => {
  return formatEventDate(dateString).toLocaleDateString("en-US", { month: "short" }).toUpperCase();
};

const getDayOfMonth = (dateString: string) => {
  return formatEventDate(dateString).getDate();
};

const getFormattedDateTime = (dateString: string) => {
  const date = formatEventDate(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
};

const getVenueAddress = (event: EventbriteEvent) => {
  const venue = event.venue;
  if (!venue) return "Online Event";

  const address = venue.address;
  const parts: string[] = [];

  if (address?.address_1) parts.push(address.address_1);
  if (address?.address_2) parts.push(address.address_2);

  return parts.length > 0 ? parts.join(", ") : venue.name || "See event for details";
};

const getTicketInfo = (event: EventbriteEvent) => {
  const ticketAvailability = event.ticket_availability;

  if (!ticketAvailability) {
    return { available: false, text: "Tickets unavailable" };
  }

  if (ticketAvailability.is_sold_out) {
    return { available: false, text: "Sold Out" };
  }

  if (ticketAvailability.has_available_tickets) {
    const minPrice = ticketAvailability.minimum_ticket_price;
    let priceText = "";

    if (minPrice) {
      if (minPrice.display === "Free" || minPrice.value === 0) {
        priceText = "Free";
      } else {
        priceText = `From ${minPrice.display}`;
      }
    }

    return { available: true, text: priceText || "Tickets Available" };
  }

  return { available: false, text: "Registration closed" };
};

const getEventImage = (event: EventbriteEvent) => {
  if (event.logo?.url) return event.logo.url;
  const eventName = event.name?.text || "Event";
  return `https://placehold.co/100x100/3b82f6/ffffff?text=${encodeURIComponent(eventName.substring(0, 3))}`;
};

export function ClassesPage() {
  const [events, setEvents] = useState<EventbriteEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const params = new URLSearchParams({
          status: "live",
          order_by: "start_asc",
          time_filter: "current_future",
          expand: "venue,ticket_availability,logo",
        });

        const response = await fetch(
          `/api/eventbrite/v3/organizations/${EVENTBRITE_ORG_ID}/events/?${params}`
        );

        if (!response.ok) throw new Error("Failed to fetch events");

        const data = await response.json();

        if (data.events && Array.isArray(data.events)) {
          // Filter to only show events from today onwards
          const now = new Date();
          now.setHours(0, 0, 0, 0);

          const filteredEvents = data.events.filter((event: EventbriteEvent) => {
            if (!event.start?.local) return false;
            const eventDate = new Date(event.start.local);
            return eventDate >= now;
          });

          setEvents(filteredEvents);
        }
      } catch (err) {
        console.error("Failed to fetch events:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <main>
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="/assets/images/stem-classroom-v2.png"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        {/* Blue Overlay */}
        <div className="absolute inset-0 bg-blue-600/85"></div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          {/* Label */}
          <p className="text-white/90 text-sm font-semibold tracking-wider uppercase mb-4">
            Classes & Learning
          </p>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Learn to Create, Build & Innovate
          </h1>

          <p className="text-white/90 text-lg md:text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
            From weekend courses to hands-on workshops, discover the skills you need to bring
            your ideas to life. All skill levels welcome.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#courses"
              className="inline-block bg-white hover:bg-gray-100 text-blue-600 font-semibold py-3 px-8 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Explore Pathways
            </a>
            <a
              href="#upcoming"
              className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-8 rounded-full transition-all duration-200 border-2 border-emerald-600 hover:border-emerald-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              View Schedule
            </a>
          </div>
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section id="upcoming" className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-12">
            <p className="text-emerald-600 text-sm font-semibold tracking-wider uppercase mb-2">
              Upcoming Events
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What's Happening Next
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Register for upcoming classes and events. Space is limited—secure your spot today.
            </p>
          </div>

          {/* Events from Eventbrite */}
          <div className="space-y-4 max-w-4xl mx-auto">
            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Loading events...</p>
              </div>
            ) : events.length > 0 ? (
              events.map((event) => {
                const ticketInfo = getTicketInfo(event);
                return (
                  <div
                    key={event.id}
                    className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow"
                  >
                    {/* Mobile Layout */}
                    <div className="md:hidden">
                      <div className="w-full h-40 rounded-lg overflow-hidden bg-gray-100 mb-4">
                        <img
                          src={getEventImage(event)}
                          alt={event.name.text}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 text-center w-14">
                          {event.start?.local && (
                            <>
                              <div className="text-blue-600 font-bold text-sm">
                                {getMonthAbbr(event.start.local)}
                              </div>
                              <div className="text-gray-900 font-bold text-2xl">
                                {getDayOfMonth(event.start.local)}
                              </div>
                            </>
                          )}
                        </div>
                        <div className="flex-grow min-w-0">
                          <h3 className="font-bold text-gray-900 text-lg mb-1">
                            {event.name.text}
                          </h3>
                          <p className="text-gray-600 text-sm mb-1">{getVenueAddress(event)}</p>
                          {event.start?.local && (
                            <p className="text-gray-500 text-sm mb-2">
                              {getFormattedDateTime(event.start.local)}
                            </p>
                          )}
                          <div className="flex items-center gap-3 flex-wrap">
                            {ticketInfo.available ? (
                              <>
                                <span className="text-green-600 text-sm font-medium">
                                  {ticketInfo.text}
                                </span>
                                <a
                                  href={`${event.url}#tickets`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-colors"
                                >
                                  Get Tickets
                                </a>
                              </>
                            ) : (
                              <span className="text-red-500 text-sm font-medium">
                                {ticketInfo.text}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden md:flex gap-4">
                      <div className="flex-shrink-0 text-center w-14">
                        {event.start?.local && (
                          <>
                            <div className="text-blue-600 font-bold text-sm">
                              {getMonthAbbr(event.start.local)}
                            </div>
                            <div className="text-gray-900 font-bold text-2xl">
                              {getDayOfMonth(event.start.local)}
                            </div>
                          </>
                        )}
                      </div>
                      <div className="flex-shrink-0 w-32 h-24 rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={getEventImage(event)}
                          alt={event.name.text}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-grow min-w-0">
                        <h3 className="font-bold text-gray-900 text-lg mb-1">{event.name.text}</h3>
                        <p className="text-gray-600 text-sm mb-1">{getVenueAddress(event)}</p>
                        {event.start?.local && (
                          <p className="text-gray-500 text-sm mb-2">
                            {getFormattedDateTime(event.start.local)}
                          </p>
                        )}
                        <div className="flex items-center gap-4 flex-wrap">
                          {ticketInfo.available ? (
                            <span className="text-green-600 text-sm font-medium">
                              {ticketInfo.text}
                            </span>
                          ) : (
                            <span className="text-red-500 text-sm font-medium">
                              {ticketInfo.text}
                            </span>
                          )}
                          <a
                            href={event.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                          >
                            View event
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                              />
                            </svg>
                          </a>
                          {ticketInfo.available && (
                            <a
                              href={`${event.url}#tickets`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-colors"
                            >
                              Get Tickets
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <img
                  src="/assets/images/coming-soon.png"
                  alt="Coming Soon"
                  className="mx-auto mb-4 max-w-xs"
                />
                <p className="text-gray-500">No upcoming events at this time. Check back soon!</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Learning Pathways Section */}
      <section id="courses" className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-12">
            <p className="text-emerald-600 text-sm font-semibold tracking-wider uppercase mb-2">
              Learning Pathways
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Choose Your Pathway
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Our pathways guide you through a sequence of courses designed to build real-world
              skills. Each pathway combines hands-on learning with project-based instruction.
            </p>
          </div>

          {/* Pathway Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {pathways.map((pathway) => (
              <div
                key={pathway.title}
                className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-2 mb-4">
                  <div
                    className={`w-12 h-12 bg-${pathway.color}-100 rounded-xl flex items-center justify-center`}
                  >
                    {pathway.icon}
                  </div>
                  <span
                    className={`text-xs font-semibold text-${pathway.color}-600 bg-${pathway.color}-50 rounded-full px-3 py-1`}
                  >
                    PATHWAY
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{pathway.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  {pathway.description}
                </p>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <div className="text-center">
            <Link
              to="/catalog"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-8 rounded-full transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Explore All Pathways & Enroll
            </Link>
          </div>
        </div>
      </section>

      {/* Registration Info Section */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-gradient-to-r from-blue-600 to-emerald-500 rounded-2xl p-8 md:p-12 text-center text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-white/90 text-lg mb-6 max-w-xl mx-auto">
              All participants must sign a waiver before attending. Complete it online in just a
              few minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://forms.office.com/r/uWEqJZjKZv"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-white hover:bg-gray-100 text-blue-600 font-semibold py-3 px-8 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Sign the Waiver
              </a>
              <Link
                to="/legal"
                className="inline-flex items-center justify-center gap-2 border-2 border-white hover:bg-white/10 text-white font-semibold py-3 px-8 rounded-full transition-all duration-200"
              >
                Read Waiver Details
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
