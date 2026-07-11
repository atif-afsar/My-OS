"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, X, Check, AlertCircle, Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";

interface VoiceCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (text: string) => void;
  shouldSaveToDb?: boolean;
}

export default function VoiceCaptureModal({
  isOpen,
  onClose,
  onSave,
  shouldSaveToDb = true,
}: VoiceCaptureModalProps) {
  const { user } = useAuthStore();
  const authHeaders: Record<string, string> = user?.id ? { "x-user-id": user.id } : {};

  const [supported, setSupported] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimText, setInterimText] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [saving, setSaving] = useState(false);

  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        setSupported(false);
        return;
      }

      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-US";

      rec.onstart = () => {
        setIsRecording(true);
        setErrorMsg("");
      };

      rec.onresult = (event: any) => {
        let finalTrans = "";
        let interimTrans = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const text = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTrans += text + " ";
          } else {
            interimTrans += text;
          }
        }

        if (finalTrans) {
          setTranscript((prev) => prev + finalTrans);
        }
        setInterimText(interimTrans);
      };

      rec.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        if (event.error === "not-allowed") {
          setErrorMsg("Microphone access denied. Please check permissions.");
        } else {
          setErrorMsg(`Error occurred: ${event.error}`);
        }
        setIsRecording(false);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  const startRecording = () => {
    if (!recognitionRef.current) return;
    setTranscript("");
    setInterimText("");
    setErrorMsg("");
    try {
      recognitionRef.current.start();
    } catch (e) {
      console.error(e);
    }
  };

  const stopRecording = () => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async () => {
    const finalNote = (transcript + " " + interimText).trim();
    if (!finalNote) return;

    if (!shouldSaveToDb) {
      if (onSave) onSave(finalNote);
      onClose();
      return;
    }

    setSaving(true);
    const todayLabel = new Date().toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

    try {
      const res = await fetch("/api/knowledge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({
          title: `Voice Note - ${todayLabel}`,
          content: finalNote,
          category: "Inbox",
          favorite: false,
        }),
      });
      const data = await res.json();

      if (data.id) {
        // Log to timeline
        await fetch("/api/timeline", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders,
          },
          body: JSON.stringify({
            type: "Mind",
            title: `Voice Captured: ${data.title}`,
            description: `Transcribed: ${finalNote.substring(0, 50)}...`,
            referenceId: data.id,
            referenceType: "Inbox",
          }),
        });

        if (onSave) onSave(finalNote);
        onClose();
      }
    } catch (e) {
      console.error("Failed to save voice note", e);
      setErrorMsg("Failed to save transcript to Inbox.");
    } finally {
      setSaving(false);
    }
  };

  // Automatically start recording when modal opens
  useEffect(() => {
    if (isOpen && supported) {
      const delay = setTimeout(() => {
        startRecording();
      }, 300);
      return () => clearTimeout(delay);
    }
  }, [isOpen, supported]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-sm border border-border bg-card rounded-2xl p-6 shadow-2xl flex flex-col gap-6"
        >
          {/* Header */}
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Voice Capture
            </span>
            <button
              onClick={() => {
                stopRecording();
                onClose();
              }}
              className="text-muted-foreground hover:text-foreground p-1 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {!supported ? (
            /* Not Supported Warning */
            <div className="flex flex-col items-center text-center gap-3 py-6">
              <AlertCircle className="w-10 h-10 text-destructive" />
              <div>
                <h3 className="font-bold text-foreground text-sm">Not Supported</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-[240px]">
                  Voice recognition is not supported in this browser. Please try Chrome, Edge, or Safari.
                </p>
              </div>
            </div>
          ) : (
            /* Active Speech Layout */
            <div className="flex flex-col items-center gap-6">
              {/* Mic Icon & Wave Pulsing */}
              <div className="relative flex items-center justify-center w-24 h-24">
                {isRecording && (
                  <>
                    <motion.div
                      animate={{ scale: [1, 1.8, 1] }}
                      transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                      className="absolute inset-0 bg-primary/15 rounded-full border border-primary/20"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.4, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut", delay: 0.3 }}
                      className="absolute inset-2 bg-primary/10 rounded-full"
                    />
                  </>
                )}
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg cursor-pointer ${
                    isRecording
                      ? "bg-primary text-primary-foreground border border-primary/20 scale-105"
                      : "bg-secondary text-muted-foreground border border-border"
                  }`}
                >
                  {isRecording ? <Mic className="w-7 h-7" /> : <MicOff className="w-7 h-7" />}
                </button>
              </div>

              {/* Status Indicator */}
              <div className="text-center">
                <span className="text-xs font-semibold text-foreground">
                  {isRecording ? "Listening..." : "Recording Paused"}
                </span>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Speak clearly into your microphone
                </p>
              </div>

              {/* Real-time Transcription Display */}
              <div className="w-full bg-background/50 border border-border rounded-xl p-4 min-h-[96px] max-h-[144px] overflow-y-auto text-sm text-foreground/90 scrollbar-thin">
                {transcript || interimText ? (
                  <>
                    <span>{transcript}</span>
                    <span className="text-muted-foreground/60">{interimText}</span>
                  </>
                ) : (
                  <span className="text-xs text-muted-foreground/50 italic">
                    Start speaking to transcribe text...
                  </span>
                )}
              </div>

              {errorMsg && (
                <div className="text-xs text-destructive flex items-center gap-1.5 justify-center w-full px-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{errorMsg}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 w-full pt-2">
                <button
                  onClick={() => {
                    stopRecording();
                    onClose();
                  }}
                  className="flex-1 h-10 border border-border rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                >
                  Discard
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || (!transcript && !interimText)}
                  className="flex-1 h-10 bg-primary text-primary-foreground rounded-lg text-xs font-semibold hover:bg-primary/95 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                >
                  {saving ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  Save Note
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
