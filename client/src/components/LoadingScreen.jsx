import { useEffect, useState } from 'react'
import logo from '../assets/logo.png'
import './LoadingScreen.css'

function LoadingScreen({ isLoading, onAnimationComplete }) {
  const [stage, setStage] = useState('loading') // loading, enlarging, hidden

  useEffect(() => {
    if (!isLoading && stage === 'loading') {
      // Data loaded, start enlarge animation
      setStage('enlarging')

      // After animation completes, hide the loading screen
      const timer = setTimeout(() => {
        setStage('hidden')
        if (onAnimationComplete) {
          onAnimationComplete()
        }
      }, 800) // Match animation duration

      return () => clearTimeout(timer)
    }
  }, [isLoading, stage, onAnimationComplete])

  if (stage === 'hidden') {
    return null
  }

  return (
    <div className={`loading-screen ${stage}`}>
      <div className="loading-content">
        <img
          src={logo}
          alt="Birdee Logo"
          className="loading-logo"
        />
        {stage === 'loading' && (
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        )}
      </div>
    </div>
  )
}

export default LoadingScreen
