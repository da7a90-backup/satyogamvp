// src/app/about/page.tsx
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
  title: 'About Shunyamurti | A Dwarf at the Feet of our Dancing Lord',
  description: 'Learn about Shunyamurti, his teachings, philosophy, and path to spiritual awakening through Sat Yoga.'
};

const AboutPage = () => {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-4">
            <p className="text-purple-600 text-sm font-medium">About</p>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-2">Shunyamurti</h1>
          <p className="text-center text-gray-600 mb-12">A Dwarf at the Feet of our Dancing Lord</p>
          
          <div className="rounded-lg overflow-hidden bg-gray-200 max-w-4xl mx-auto aspect-video relative">
            <Image 
              src="/images/shunyamurti-placeholder.jpg" 
              alt="Shunyamurti" 
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </section>

      {/* What is Shunyamurti Section */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold mb-8">What is Shunyamurti?</h2>
            </div>
            <div className="space-y-6">
              <p className="text-gray-700">
                A 'what' more than a 'who' is accurate. To understand Shunyamurti, one must understand the messages that come through the medium. It requires a radical paradigm shift. The name reveals the truth: Shunya means empty. Murti means form. Can we take seriously that our teacher is an empty form? Moreover, he is not unique. We are all empty forms, but most do not want to know that.
              </p>
              <p className="text-gray-700">
                Emptiness is a central term in all the Asian wisdom schools. It signifies that the bodily character is unreal, a mere appearance in a holographic light show disguised as a world. But this light show is made of the Light of Infinite Consciousness. Once there has been recognition of the emptiness of all forms, then the Real Self underlying, pervading, and dreaming the cosmic play can be realized. At that point, the other side of emptiness is revealed as the unmanifest, formless Fullness of eternal and unlimited power and freedom.
              </p>
              <p className="text-gray-700">
                The One Intelligence is dreaming all of us, and is the inmost Self of each apparent entity. In the case of Shunyamurti, the recognition of the fictional nature of the world and of people came early in the vehicle's existence, which led to a life free of conventional constraints, enabling the character to resist the temptations to settle for anything less than the full unfoldment of the potency of Consciousness.
              </p>
              <p className="text-gray-700">
                That potency is the power to silence the mind. It is in the stillness of Total Presence that the energy and information from the Infinite Self can be channelled through the bodily icon. The teachings of Sat Yoga have come from that Source.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission and Vision Section */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold mb-8">On mission and vision</h2>
              <div className="rounded-lg overflow-hidden bg-gray-600 aspect-video relative mt-6">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <p className="text-gray-700">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <blockquote className="text-xl md:text-2xl text-gray-700 italic mb-8">
              "Once a soul awakens to the Supreme Self—which is always a function of grace—it gladly bows before the Lord in adoring surrender. The job of the character is only to empty itself of ego and become refashioned as a pure instrument of God."
            </blockquote>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                <Image 
                  src="/images/placeholder.jpg" 
                  alt="Shunyamurti"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              </div>
              <span className="font-medium">Shunyamurty</span>
            </div>
          </div>
        </div>
      </section>

            {/* Publications Section */}
            <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <p className="text-purple-600 text-sm font-medium">Store</p>
              <h2 className="text-3xl md:text-4xl font-bold mt-1">Sat Yoga Publications</h2>
            </div>
            <Link href="/store" className="text-sm font-medium bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-800 transition">
              View all
            </Link>
          </div>
          
          <p className="text-gray-700 mb-10 max-w-4xl">
            Shunyamurti's books convey the knowledge you need to gain mastery over the ego mind 
            and attain complete liberation from illusion and anxiety—in fact, every kind of suffering
            can be transcended. This is the great value of understanding these teachings. Many more
            unpublished writings are ready to be turned into books, once we get the resources to do
            that. In the meantime, four mind-expanding and heart-opening volumes have been
            published:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Book 1 */}
            <div className="bg-gray-100 rounded-lg overflow-hidden">
              <div className="aspect-[3/4] relative">
                <Image 
                  src="/images/book-placeholder.jpg" 
                  alt="Book cover" 
                  fill
                  className="object-cover"
                />
                <button className="absolute top-4 right-4 bg-gray-200 p-2 rounded-full">
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </button>
              </div>
              <div className="p-4">
                <p className="text-purple-600 text-sm">Reads</p>
                <h3 className="font-bold text-lg mb-1">The Transformational Imperative</h3>
                <p className="text-gray-600 text-sm mb-3">Lorem ipsum dolor sit amet consectetur. Gravida nunc magna ac non tincidunt cras odio egestas leo. Lorem ipsum dolor sit amet consectetur. Gravida nunc magna ac non tincidunt</p>
                <p className="font-bold mb-4">$20,00</p>
                <button className="w-full py-2 border border-gray-300 rounded font-medium hover:bg-gray-50 transition">
                  Add to card
                </button>
              </div>
            </div>
            
            {/* Book 2 */}
            <div className="bg-gray-100 rounded-lg overflow-hidden">
              <div className="aspect-[3/4] relative">
                <Image 
                  src="/images/book-placeholder.jpg" 
                  alt="Book cover" 
                  fill
                  className="object-cover"
                />
                <button className="absolute top-4 right-4 bg-gray-200 p-2 rounded-full">
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </button>
              </div>
              <div className="p-4">
                <p className="text-purple-600 text-sm">Reads</p>
                <h3 className="font-bold text-lg mb-1">Gems of Wisdom, Volume 1</h3>
                <p className="text-gray-600 text-sm mb-3">Lorem ipsum dolor sit amet consectetur. Gravida nunc magna ac non tincidunt cras odio egestas leo. Lorem ipsum dolor sit amet consectetur. Gravida nunc magna ac non tincidunt</p>
                <p className="font-bold mb-4">$20,00</p>
                <button className="w-full py-2 border border-gray-300 rounded font-medium hover:bg-gray-50 transition">
                  Add to card
                </button>
              </div>
            </div>
            
            {/* Book 3 */}
            <div className="bg-gray-100 rounded-lg overflow-hidden">
              <div className="aspect-[3/4] relative">
                <Image 
                  src="/images/book-placeholder.jpg" 
                  alt="Book cover" 
                  fill
                  className="object-cover"
                />
                <button className="absolute top-4 right-4 bg-gray-200 p-2 rounded-full">
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </button>
              </div>
              <div className="p-4">
                <p className="text-purple-600 text-sm">Reads</p>
                <h3 className="font-bold text-lg mb-1">Gems of Wisdom, Volume 2</h3>
                <p className="text-gray-600 text-sm mb-3">Lorem ipsum dolor sit amet consectetur. Gravida nunc magna ac non tincidunt cras odio egestas leo. Lorem ipsum dolor sit amet consectetur. Gravida nunc magna ac non tincidunt</p>
                <p className="font-bold mb-4">$15,00</p>
                <button className="w-full py-2 border border-gray-300 rounded font-medium hover:bg-gray-50 transition">
                  Add to card
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Curriculum Vitae Section */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-4">
            <p className="text-purple-600 text-sm font-medium">About</p>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-12">Shunyamurti's Curriculum Vitae</h2>
          
          <div className="space-y-8">
            <div className="border-l-4 border-purple-600 pl-6">
              <h3 className="text-xl font-bold mb-4">A Time of Accelerated Growth</h3>
              <p className="text-gray-700">
                Consciousness awakened early, and as a child, he would spend afternoons contemplating and writing poetry. This led to the urge to read the works of classic and contemporary poetry. On the physical side, he was active in sports and martial arts. Political consciousness awakened with the news of the murder of President Kennedy. He became an activist opposing the U.S. war in Vietnam—which brought him to the study of Gandhi, the Bhagavad Gita, and other fascinating and inspiring texts—that explained his own inner states. His search culminated in the discovery of the books of Sri Ramana Maharishi, who most clearly exemplified the eternal Truths. No doubt remained.
              </p>
            </div>
            
            <div className="border-l-4 border-purple-600 pl-6">
              <h3 className="text-xl font-bold mb-4">Advocate for Truth</h3>
              <p className="text-gray-700">
                The fullness of life inevitably included abundant experimentation with psychedelics, hitchhiking adventures that brought him to many parts of the country, and later of the world, meeting leading figures in the avant-garde, and participating in some extraordinary events. The most profound was encountering Baba Hari Dass. The presence of that shining being brought overwhelming love, and a long period of discipleship.
              </p>
            </div>
            
            <div className="border-l-4 border-purple-600 pl-6">
              <h3 className="text-xl font-bold mb-4">Formal Yogic Training</h3>
              <p className="text-gray-700">
                After graduating university with a double major in philosophy and drama, with a minor in literature, he became the director of an international book club in New York, focused on insightful analyses of current issues in geopolitics. This enabled him to have lunch with many famous authors. But he had his own journey to go on, and could not settle for a life in that bandwidth. The deeper adventure then began. It is too long to recount. The freedom of the sixties counterculture was the portal. There were academic interludes, earning a law degree and a psychology doctorate. The practice of law was likewise stultifying, but his interest in cosmic law (to structure future human interactions with extra-terrestrial visitors) and karmic law, as well as the genuine worldly wisdom hidden at the heart of our degraded legal systems—plus learning first-hand how the system worked—had made the effort worthwhile.
              </p>
            </div>
            
            <div className="border-l-4 border-purple-600 pl-6">
              <h3 className="text-xl font-bold mb-4">A Journey of Self-realization</h3>
              <p className="text-gray-700">
                At some point, he was rescued from a career as an attorney during a fervent solitary meditation retreat on a mountaintop. The Great Spirit abducted him and rushed him to India, to be immersed in the vibrational frequency of the Divine Presence. He bathed for ten years in that holy river of Gyana and Shakti, becoming an adept yogi, an avowed member of an ashram sangha, before being sent out to practice healing and assist in transmitting the true frequency.
              </p>
            </div>
            
            <div className="border-l-4 border-purple-600 pl-6">
              <h3 className="text-xl font-bold mb-4">Responding with Love & Power to a world in chaos</h3>
              <p className="text-gray-700">
                After a stint as a journalist writing about Indian politics and spirituality—and getting a press pass to witness Indira Gandhi meet Ronald Reagan in the Oval Office, and to mingle with the Washington press corps, which brought a far more vivid understanding of the deep state—he converted his skill in meditation into a therapeutic form of hypnosis and visualization, and began counselling people in need of such help. To refine his clinical skills, he took graduate school courses in psychology at night and on weekends.
              </p>
            </div>
            
            <div className="border-l-4 border-purple-600 pl-6">
              <h3 className="text-xl font-bold mb-4">A master teacher of the Heart</h3>
              <p className="text-gray-700">
                A flourishing practice of transformational healing unfolded, evolving in phases from hypnotherapy and energy work to past life regression therapy, including exorcism and depossession, to ghost busting at haunted houses, to working with people who had been captured and released by aliens, to removing curses that had been put on people by practitioners of black magic, and sometimes getting psychically attacked by those dark forces in revenge. A great deal was learned about the world of the occult and paranormal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-purple-600 text-sm font-medium mb-8">Testimonial carrousel</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-600 aspect-video rounded-lg relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path>
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col justify-center">
              <blockquote className="text-xl text-gray-700 mb-6">
                Many thanks to the Ashram and Shunya for facilitating this retreat. It was a wonderful and magical experience with deep knowledge and wisdom to keep going on the hero's path. Shunya's way of teaching–as always–is so open and well built up with lots of history and humor. I love that! What I like the most is that it truly helps in the process of realization.
              </blockquote>
              <div>
                <p className="font-medium">Lauren</p>
                <p className="text-gray-600">The Netherlands</p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center mt-8 space-x-2">
            <span className="h-2.5 w-2.5 bg-purple-600 rounded-full"></span>
            <span className="h-2.5 w-2.5 bg-gray-300 rounded-full"></span>
          </div>
          
          <div className="flex justify-end mt-8 space-x-4">
            <button className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Sri Ramana Maharshi Section */}
      <section className="py-12 md:py-16 bg-gray-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-6">
            <div className="w-24 h-24 bg-gray-500 rounded-lg mx-auto flex items-center justify-center">
              <Image 
                src="/images/placeholder.jpg" 
                alt="Sri Ramana Maharshi"
                width={64}
                height={64}
                className="rounded"
              />
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Sri Ramana Maharshi</h2>
          <p className="max-w-3xl mx-auto">
            Shunyamurti connects always with the resonant presence of Sri Ramana Maharshi as his closest teacher, for whom he feels the deepest reverence.
          </p>
        </div>
      </section>

      {/* Retreats Section */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-4">
            <p className="text-purple-600 text-sm font-medium">Calendar</p>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Stunning Online Retreats</h2>
          <p className="text-gray-700 mb-12 max-w-4xl">
            Shunyamurti offers ongoing satsangs for members and a number of yearly livestreamed seminars and retreats open to the public. Each one is unique, but they are always more powerful than the last, always relevant and geopolitically informed, and always paradigm-shifting, ego-busting, shakti-filled events. Priceless direct guidance in real time—including the opportunity to ask Shunyamurti your most urgent questions live—make these events imperative for serious seekers.
          </p>
          
          <div className="bg-white rounded-lg overflow-hidden shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-6 md:p-10 bg-gray-100">
                <div className="text-center max-w-xs mx-auto">
                  <p className="text-gray-500 text-sm">Sat</p>
                  <p className="text-4xl font-bold mb-1">17</p>
                  <p className="text-gray-600 text-sm">Fri Dec 2024</p>
                </div>
                
                <div className="mt-8 aspect-video bg-gray-300 rounded-lg relative">
                  <Image 
                    src="/images/placeholder.jpg" 
                    alt="Retreat"
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              </div>
              
              <div className="p-6 md:p-10">
                <div className="mb-6">
                  <span className="inline-block px-3 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">Next event</span>
                </div>
                <h3 className="text-2xl font-bold mb-1">Shakti Saturation</h3>
                <div className="flex items-center space-x-2 text-gray-600 mb-4">
                  <span>Onsite</span>
                  <span>•</span>
                  <span>3 days</span>
                </div>
                <p className="text-gray-700 mb-8">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.
                </p>
                <Link href="/calendar" className="inline-block bg-gray-900 text-white px-5 py-3 rounded font-medium hover:bg-gray-800 transition">
                  Save my spot
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default AboutPage;