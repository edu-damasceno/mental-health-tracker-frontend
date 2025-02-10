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

interface LogEntryFormProps {
  logId?: string;
}

export function EditLogForm({ logId }: LogEntryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [logDate, setLogDate] = useState<Date | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
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

  useEffect(() => {
    if (logId) {
      const fetchLog = async () => {
        try {
          setIsLoading(true);
          const response = await api.get(`/api/logs/${logId}`);

          // Parse dates from the response
          setLogDate(new Date(response.data.createdAt));
          setLastUpdated(new Date(response.data.updatedAt));

          const logData = {
            ...response.data,
            moodLevel: Number(response.data.moodLevel),
            anxietyLevel: Number(response.data.anxietyLevel),
            sleepQuality: Number(response.data.sleepQuality),
            stressLevel: Number(response.data.stressLevel),
            sleepHours: Number(response.data.sleepHours),
            symptomSeverity: response.data.symptomSeverity
              ? Number(response.data.symptomSeverity)
              : null,
          };

          reset(logData);
        } catch (error) {
          toast.error("Failed to load log data");
          router.push("/dashboard");
        } finally {
          setIsLoading(false);
        }
      };

      fetchLog();
    }
  }, [logId, reset, router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h3 className="text-2xl font-semibold text-gray-900">
            Edit Log Entry
          </h3>
          <div className="mt-1 space-y-1">
            <p className="text-sm text-gray-500">
              Log Date:{" "}
              {logDate ? format(logDate, "EEEE, MMMM d, yyyy") : "Loading..."}
            </p>
            {lastUpdated && lastUpdated.getTime() !== logDate?.getTime() && (
              <p className="text-xs text-gray-400">
                Last updated: {format(lastUpdated, "MMM d, yyyy 'at' h:mm a")}
              </p>
            )}
          </div>
        </div>
      </div>

      <form
        onSubmit={async (e) => {
          e.preventDefault();

          const formData = {
            moodLevel: formValues.moodLevel,
            anxietyLevel: formValues.anxietyLevel,
            sleepHours: formValues.sleepHours,
            sleepQuality: formValues.sleepQuality,
            stressLevel: formValues.stressLevel,
            physicalActivity: formValues.physicalActivity?.trim() || "None",
            socialInteractions: formValues.socialInteractions?.trim() || "None",
            symptoms: formValues.symptoms?.trim() || "",
            primarySymptom: formValues.primarySymptom?.trim() || "",
            symptomSeverity: formValues.symptomSeverity || null,
          };

          // Validate all fields are numbers where required
          const numericData = {
            ...formData,
            moodLevel: Number(formData.moodLevel),
            anxietyLevel: Number(formData.anxietyLevel),
            sleepHours: Number(formData.sleepHours),
            sleepQuality: Number(formData.sleepQuality),
            stressLevel: Number(formData.stressLevel),
            symptomSeverity: formData.symptomSeverity
              ? Number(formData.symptomSeverity)
              : null,
          };

          try {
            setIsSubmitting(true);
            const response = await api.put(`/api/logs/${logId}`, numericData);
            toast.success("Log updated successfully!");
            router.push("/dashboard");
          } catch (error: any) {
            toast.error("Failed to update log");
          } finally {
            setIsSubmitting(false);
          }
        }}
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
          {isSubmitting ? <LoadingSpinner /> : "Update Log Entry"}
        </button>
      </form>
    </div>
  );
}
