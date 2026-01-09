import { Injectable } from '@angular/core';

/**
 * Service to handle audio playback for user feedback
 * Provides methods to play sound effects with graceful error handling
 */
@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private audioCache: Map<string, HTMLAudioElement> = new Map();

  constructor() { }

  /**
   * Play an audio file
   * @param audioPath Path to the audio file (e.g., 'assets/success-beep.wav')
   * @returns Promise that resolves when audio starts playing or rejects on error
   */
  public playSound(audioPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Check if audio is already cached
        let audio = this.audioCache.get(audioPath);
        
        if (!audio) {
          // Create new audio element and cache it
          audio = new Audio(audioPath);
          this.audioCache.set(audioPath, audio);
        }

        // Reset to beginning if already playing
        audio.currentTime = 0;

        // Play the audio
        const playPromise = audio.play();

        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              resolve();
            })
            .catch((error) => {
              // Handle autoplay restrictions or other playback errors
              console.warn('Audio playback failed:', error);
              reject(error);
            });
        } else {
          resolve();
        }
      } catch (error) {
        console.warn('Error creating audio element:', error);
        reject(error);
      }
    });
  }

  /**
   * Play the success beep sound
   * This is a convenience method for the QR scanner success feedback
   */
  public playSuccessBeep(): Promise<void> {
    return this.playSound('assets/success-beep.wav');
  }

  /**
   * Clear the audio cache to free memory
   */
  public clearCache(): void {
    this.audioCache.clear();
  }
}
