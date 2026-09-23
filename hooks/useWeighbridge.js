'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Custom React Hook for connecting to Digital Weighbridge Scales via Web Serial API (RS232 / USB)
 */
export function useWeighbridge() {
  const [isSupported, setIsSupported] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [liveWeight, setLiveWeight] = useState(0.0);
  const [unit, setUnit] = useState('KG');
  const [error, setError] = useState(null);
  const [port, setPort] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serial' in navigator) {
      setIsSupported(true);
    }
  }, []);

  const connectScale = useCallback(async () => {
    if (!isSupported) {
      setError('Web Serial API is not supported in this browser. Use Chrome, Edge, or Opera over HTTPS.');
      return;
    }

    try {
      setError(null);
      // Request serial port from browser hardware picker
      const selectedPort = await navigator.serial.requestPort();
      await selectedPort.open({ baudRate: 9600, dataBits: 8, stopBits: 1, parity: 'none' });

      setPort(selectedPort);
      setIsConnected(true);

      // Start continuous reader stream loop
      readSerialData(selectedPort);
    } catch (err) {
      setError(`Failed to connect scale: ${err.message}`);
      setIsConnected(false);
    }
  }, [isSupported]);

  const readSerialData = async (activePort) => {
    const textDecoder = new TextDecoderStream();
    const readableStreamClosed = activePort.readable.pipeTo(textDecoder.writable);
    const reader = textDecoder.readable.getReader();

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        if (value) {
          // Parse numeric weight string from indicator output stream e.g. "ST,GS,  150.50kg"
          const matches = value.match(/([0-9]+\.?[0-9]*)/);
          if (matches && matches[1]) {
            const parsedWeight = parseFloat(matches[1]);
            if (!isNaN(parsedWeight)) {
              setLiveWeight(parsedWeight);
            }
          }
        }
      }
    } catch (err) {
      setError(`Serial stream error: ${err.message}`);
    } finally {
      reader.releaseLock();
    }
  };

  const disconnectScale = useCallback(async () => {
    if (port) {
      try {
        await port.close();
        setPort(null);
        setIsConnected(false);
      } catch (err) {
        setError(`Error disconnecting: ${err.message}`);
      }
    }
  }, [port]);

  return {
    isSupported,
    isConnected,
    liveWeight,
    unit,
    error,
    connectScale,
    disconnectScale,
    setLiveWeight, // Manual fallback setter
  };
}
