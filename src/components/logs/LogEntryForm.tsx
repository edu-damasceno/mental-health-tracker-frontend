"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Rating } from "@/components/ui/rating";
import { TextArea } from "@/components/ui/textarea";
import { toast } from "react-hot-toast";
import api from "@/lib/api";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useRouter } from "next/navigation";

const logSchema = z.object({
  moodLevel: z.number().min(1).max(5).int(),
  anxietyLevel: z.number().min(1).max(5).int(),
  sleepHours: z
    .number()
    .min(0, "Sleep hours cannot be negative")
    .max(24, "Sleep hours cannot exceed 24")
    .multipleOf(0.5, "Sleep hours must be in increments of 0.5"),
  sleepQuality: z.number().min(1).max(5).int(),
  physicalActivity: z.string().optional(),
  socialInteractions: z.string().optional(),
  stressLevel: z.number().min(1).max(5).int(),
  symptoms: z.string().default(""),
  primarySymptom: z.string().optional().default(""),
  symptomSeverity: z.number().min(1).max(5).optional().nullable(),
});

type LogFormData = z.infer<typeof logSchema>;

export function LogEntryForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<LogFormData>({
    resolver: zodResolver(logSchema),
    defaultValues: {
      moodLevel: 3,
      anxietyLevel: 3,
      sleepHours: 7,
      sleepQuality: 3,
      stressLevel: 3,
      symptoms: "",
    },
  });

  // Watch all form values
  const formValues = watch();

  // Add effect to reset symptom-related fields when symptoms are cleared
  useEffect(() => {
    if (!formValues.symptoms) {
      setValue("primarySymptom", "");
      setValue("symptomSeverity", null);
    }
  }, [formValues.symptoms, setValue]);

  const onSubmit = async (data: LogFormData): Promise<void> => {
    try {
      setIsSubmitting(true);

      const formData = {
        // Required numeric fields
        moodLevel: Number(data.moodLevel),
        anxietyLevel: Number(data.anxietyLevel),
        sleepHours: Number(data.sleepHours),
        sleepQuality: Number(data.sleepQuality),
        stressLevel: Number(data.stressLevel),

        // String fields with defaults
        physicalActivity: data.physicalActivity?.trim() || "None",
        socialInteractions: data.socialInteractions?.trim() || "None",
        symptoms: data.symptoms?.trim() || "",
        primarySymptom: data.primarySymptom?.trim() || "",
        symptomSeverity: data.symptoms?.trim()
          ? data.symptomSeverity
            ? Number(data.symptomSeverity)
            : null
          : null,
      };

      await api.post("/api/logs", formData);
      toast.success("Log created successfully!");
      router.push("/dashboard");
    } catch (error: unknown) {
      const err = error as {
        response?: {
          status?: number;
          data?: { error?: string };
        };
      };
      const errorMessage = err.response?.data?.error || "Failed to submit log";
      console.error("💥 Error submitting log:", {
        message: errorMessage,
        status: err.response?.status,
        data: err.response?.data,
      });
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h3 className="text-2xl font-semibold text-gray-900">
            Daily Log Entry
          </h3>
          <div className="mt-2">
            <p className="text-base font-medium text-gray-600">
              {format(new Date(), "EEEE, MMMM d, yyyy")}
            </p>
            <p className="text-xs text-gray-400 mt-1">Recording for today</p>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit((data) => {
          return onSubmit(data);
        })}
        className="space-y-8"
        noValidate
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="col-span-2">
            <h4 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b">
              Mood & Anxiety
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Rating
                label="Mood Level"
                min={1}
                max={5}
                value={formValues.moodLevel}
                {...register("moodLevel", {
                  valueAsNumber: true,
                  onChange: (e) => {
                    setValue("moodLevel", Number(e.target.value), {
                      shouldDirty: true,
                      shouldTouch: true,
                    });
                  },
                })}
                error={errors.moodLevel?.message}
                description="How are you feeling today?"
                labels={["Very Sad", "Sad", "Neutral", "Happy", "Very Happy"]}
              />

              <Rating
                label="Anxiety Level"
                min={1}
                max={5}
                value={formValues.anxietyLevel}
                {...register("anxietyLevel", {
                  valueAsNumber: true,
                  onChange: (e) => {
                    setValue("anxietyLevel", Number(e.target.value), {
                      shouldDirty: true,
                      shouldTouch: true,
                    });
                  },
                })}
                error={errors.anxietyLevel?.message}
                description="How anxious do you feel?"
                labels={[
                  "Very Calm",
                  "Calm",
                  "Neutral",
                  "Anxious",
                  "Very Anxious",
                ]}
              />
            </div>
          </div>

          <div className="col-span-2">
            <h4 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b">
              Sleep
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Sleep Hours"
                type="number"
                min={0}
                max={24}
                step="0.5"
                {...register("sleepHours", {
                  valueAsNumber: true,
                  min: {
                    value: 0,
                    message: "Sleep hours cannot be negative",
                  },
                  max: {
                    value: 24,
                    message: "Sleep hours cannot exceed 24",
                  },
                })}
                error={errors.sleepHours?.message}
                placeholder="Enter hours of sleep (0-24)"
              />

              <Rating
                label="Sleep Quality"
                min={1}
                max={5}
                value={formValues.sleepQuality}
                {...register("sleepQuality", {
                  valueAsNumber: true,
                  onChange: (e) => {
                    setValue("sleepQuality", Number(e.target.value), {
                      shouldDirty: true,
                      shouldTouch: true,
                    });
                  },
                })}
                error={errors.sleepQuality?.message}
                description="How well did you sleep?"
                labels={["Very Poor", "Poor", "Fair", "Good", "Very Good"]}
              />
            </div>
          </div>

          <div className="col-span-2">
            <h4 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b">
              Activities
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TextArea
                label="Physical Activity"
                {...register("physicalActivity")}
                error={errors.physicalActivity?.message}
                placeholder="E.g., 30 minutes of jogging, yoga session, walking (leave empty if none)"
              />

              <TextArea
                label="Social Interactions"
                {...register("socialInteractions")}
                error={errors.socialInteractions?.message}
                placeholder="E.g., Met with friends, family dinner, video call with relatives (leave empty if none)"
              />
            </div>
          </div>

          <div className="col-span-2">
            <h4 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b">
              Stress & Symptoms
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Rating
                label="Stress Level"
                min={1}
                max={5}
                value={formValues.stressLevel}
                {...register("stressLevel", {
                  valueAsNumber: true,
                  onChange: (e) => {
                    setValue("stressLevel", Number(e.target.value), {
                      shouldDirty: true,
                      shouldTouch: true,
                    });
                  },
                })}
                error={errors.stressLevel?.message}
                description="How stressed do you feel?"
                labels={["Very Low", "Low", "Moderate", "High", "Very High"]}
              />

              <TextArea
                label="Symptoms"
                {...register("symptoms")}
                error={errors.symptoms?.message}
                placeholder="E.g., Headache, fatigue, anxiety, difficulty sleeping (leave empty if none)"
              />

              {formValues.symptoms && formValues.symptoms.length > 0 && (
                <>
                  <Input
                    label="Primary Symptom (optional)"
                    {...register("primarySymptom")}
                    error={errors.primarySymptom?.message}
                  />

                  <Rating
                    label="Symptom Severity"
                    min={1}
                    max={5}
                    value={formValues.symptomSeverity ?? undefined}
                    {...register("symptomSeverity", {
                      valueAsNumber: true,
                      onChange: (e) => {
                        setValue("symptomSeverity", Number(e.target.value), {
                          shouldDirty: true,
                          shouldTouch: true,
                        });
                      },
                    })}
                    error={errors.symptomSeverity?.message}
                    description="How severe are your symptoms?"
                    labels={[
                      "Very Mild",
                      "Mild",
                      "Moderate",
                      "Severe",
                      "Very Severe",
                    ]}
                  />
                </>
              )}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full px-4 py-2 text-white font-medium rounded-md ${
            isSubmitting
              ? "bg-blue-300 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          <span className="flex items-center justify-center">
            {isSubmitting ? (
              <>
                <LoadingSpinner />
                <span className="ml-2">Creating...</span>
              </>
            ) : (
              "Create Log Entry"
            )}
          </span>
        </button>
      </form>
    </div>
  );
}
