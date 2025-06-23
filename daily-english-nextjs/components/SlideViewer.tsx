'use client'

import { useState, useEffect, useCallback } from 'react'
import { marked } from 'marked'
import { Topic, Slide } from '@/lib/topics'
import { WordLookupManager } from '@/components/word-lookup/WordLookupManager'
import { type Dictionary } from '@/types/dictionary'

interface SlideViewerProps {
  topic: Topic
  interactive?: boolean
  theme?: 'light' | 'dark'
  dictionary: Dictionary
}

export default function SlideViewer({
  topic,
  dictionary
}: SlideViewerProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  // Define navigation functions first
  const nextSlide = useCallback(() => {
    setCurrentSlide(prev => Math.min(prev + 1, topic.slides.length - 1))
  }, [topic.slides.length])

  const previousSlide = useCallback(() => {
    setCurrentSlide(prev => Math.max(prev - 1, 0))
  }, [])

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(Math.max(0, Math.min(index, topic.slides.length - 1)))
  }, [topic.slides.length])

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }, [])

  const exitFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }, [])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowLeft':
        case 'ArrowUp':
          previousSlide()
          break
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ':
          nextSlide()
          break
        case 'Home':
          setCurrentSlide(0)
          break
        case 'End':
          setCurrentSlide(topic.slides.length - 1)
          break
        case 'Escape':
          if (isFullscreen) {
            exitFullscreen()
          }
          break
        case 'f':
        case 'F11':
          event.preventDefault()
          toggleFullscreen()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentSlide, topic.slides.length, isFullscreen, nextSlide, previousSlide, toggleFullscreen, exitFullscreen])


  // Touch gesture handling
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }, [])

  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe && currentSlide < topic.slides.length - 1) {
      nextSlide()
    }
    if (isRightSwipe && currentSlide > 0) {
      previousSlide()
    }
  }, [touchStart, touchEnd, currentSlide, topic.slides.length, nextSlide, previousSlide])

  const renderSlideContent = (slide: Slide) => {
    const html = marked(slide.content) as string
    return <div dangerouslySetInnerHTML={{ __html: html }} />
  }

  const currentSlideData = topic.slides[currentSlide]

  // Sync fullscreen state with external fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  return (
    <div className={`h-full w-full flex flex-col bg-slate-800 text-white ${isFullscreen ? 'fixed top-0 left-0 w-screen h-screen z-[9999]' : ''}`}>
      {/* Navigation Header */}
      {!isFullscreen && (
        <header className="bg-black/10 backdrop-blur-lg px-4 sm:px-8 py-2 sm:py-4 flex justify-between items-center">
          <div className="min-w-0 flex-1 mr-4">
            <h1 className="text-sm sm:text-xl md:text-2xl font-semibold mb-1 truncate">{topic.title}</h1>
            <div className="text-slate-400 text-xs sm:text-sm">
              Slide {currentSlide + 1} of {topic.slides.length}
            </div>
          </div>
          <div className="flex gap-2 sm:gap-4 flex-shrink-0">
            <button 
              onClick={toggleFullscreen} 
              className="bg-white/10 hover:bg-white/20 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-lg transition-all duration-200 border-none cursor-pointer text-xs sm:text-sm"
            >
              🔳 <span className="hidden sm:inline">Fullscreen</span>
            </button>
            <button 
              onClick={() => window.history.back()} 
              className="bg-white/10 hover:bg-white/20 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-lg transition-all duration-200 border-none cursor-pointer text-xs sm:text-sm"
            >
              ← <span className="hidden sm:inline">Back</span>
            </button>
          </div>
        </header>
      )}

      {/* Main Slide Display */}
      <main className="flex-1 flex items-center justify-center relative p-2 sm:p-4 md:p-8">
        <WordLookupManager className="w-full max-w-5xl bg-white text-slate-800 rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden relative" dictionary={dictionary}>
          <div 
            className="h-full w-full"
            style={{ aspectRatio: '16/10' }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="h-full p-4 sm:p-6 md:p-8 lg:p-12 flex flex-col justify-center overflow-y-auto">
              <div className="slide-content text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed">
                {renderSlideContent(currentSlideData)}
              </div>
            </div>
          </div>
        </WordLookupManager>

        {/* Desktop Navigation Arrows */}
        <button
          className={`hidden lg:flex absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 xl:w-16 xl:h-16 rounded-full backdrop-blur-lg text-xl xl:text-2xl items-center justify-center transition-all duration-200 border-none cursor-pointer
            ${currentSlide === 0 
              ? 'bg-white/5 text-white/30 cursor-not-allowed' 
              : 'bg-white/10 hover:bg-white/20 text-white hover:scale-110'
            }`}
          onClick={previousSlide}
          disabled={currentSlide === 0}
          aria-label="Previous slide"
        >
          ←
        </button>
        <button
          className={`hidden lg:flex absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 xl:w-16 xl:h-16 rounded-full backdrop-blur-lg text-xl xl:text-2xl items-center justify-center transition-all duration-200 border-none cursor-pointer
            ${currentSlide === topic.slides.length - 1 
              ? 'bg-white/5 text-white/30 cursor-not-allowed' 
              : 'bg-white/10 hover:bg-white/20 text-white hover:scale-110'
            }`}
          onClick={nextSlide}
          disabled={currentSlide === topic.slides.length - 1}
          aria-label="Next slide"
        >
          →
        </button>
      </main>

      {/* Mobile Navigation Buttons */}
      <div className="lg:hidden flex justify-center gap-4 px-4 py-2">
        <button
          className={`flex items-center justify-center w-12 h-12 rounded-full backdrop-blur-lg text-lg transition-all duration-200 border-none cursor-pointer
            ${currentSlide === 0 
              ? 'bg-white/5 text-white/30 cursor-not-allowed' 
              : 'bg-white/10 hover:bg-white/20 text-white active:scale-95'
            }`}
          onClick={previousSlide}
          disabled={currentSlide === 0}
          aria-label="Previous slide"
        >
          ←
        </button>
        <button
          className={`flex items-center justify-center w-12 h-12 rounded-full backdrop-blur-lg text-lg transition-all duration-200 border-none cursor-pointer
            ${currentSlide === topic.slides.length - 1 
              ? 'bg-white/5 text-white/30 cursor-not-allowed' 
              : 'bg-white/10 hover:bg-white/20 text-white active:scale-95'
            }`}
          onClick={nextSlide}
          disabled={currentSlide === topic.slides.length - 1}
          aria-label="Next slide"
        >
          →
        </button>
      </div>

      {/* Slide Navigation Dots */}
      <nav className="flex justify-center gap-1 sm:gap-2 px-4 py-3 sm:py-4 overflow-x-auto">
        {topic.slides.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-200 border-none cursor-pointer flex-shrink-0 ${
              index === currentSlide
                ? 'bg-white scale-[1.2] sm:scale-[1.3]'
                : 'bg-white/30 hover:bg-white/60 active:bg-white/80'
            }`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </nav>

      {/* Progress Bar */}
      <div className="h-1 bg-white/10">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300 ease-out"
          style={{ width: `${((currentSlide + 1) / topic.slides.length) * 100}%` }}
        />
      </div>


      {/* Keyboard Shortcuts Help */}
      {isFullscreen && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-lg text-white px-4 py-2 rounded-lg text-sm z-50">
          <div className="text-center">
            ← → Navigation | F Fullscreen | ESC Exit
          </div>
        </div>
      )}
    </div>
  )
}