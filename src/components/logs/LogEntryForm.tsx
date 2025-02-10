"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Rating } from "@/components/ui/rating";
import { TextArea } from "@/components/ui/textarea";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { LoadingSpinner } from "@/components/LoadingSpinner";

const logSchema = z.object({
  moodLevel: z.number().min(1).max(5).int(),
  anxietyLevel: z.number().min(1).max(5).int(),
  sleepHours: z
    .number()
    .min(0, "Sleep hours cannot be negative")
    .max(24, "Sleep hours cannot exceed 24")
    .multipleOf(0.5, "Sleep hours must be in increments of 0.5"),
  sleepQuality: z.number().min(1).max(5).int(),
  physicalActivity: z.string().optional().default(""),
  socialInteractions: z.string().optional().default(""),
  stressLevel: z.number().min(1).max(5).int(),
  symptoms: z.string().optional().default(""),
  primarySymptom: z.string().optional().default(""),
  symptomSeverity: z.number().min(1).max(5).optional().nullable(),
});

type LogFormData = z.infer<typeof logSchema>;

interface LogResponse extends LogFormData {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export function LogEntryForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingLog, setExistingLog] = useState<LogResponse | null>(null);
  const [isFormReady, setIsFormReady] = useState(false);
  const [initialValues, setInitialValues] = useState<LogFormData | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isFormValid, setIsFormValid] = useState(false);

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

  // Simple function to check if values are different
  const hasChanges = () => {
    if (!existingLog) return true; // Allow saving if no existing log
    if (!initialValues || !isFormReady) return false;

    // Compare each field
    const changes = {
      moodLevel:
        Number(formValues.moodLevel) !== Number(initialValues.moodLevel),
      anxietyLevel:
        Number(formValues.anxietyLevel) !== Number(initialValues.anxietyLevel),
      sleepQuality:
        Number(formValues.sleepQuality) !== Number(initialValues.sleepQuality),
      stressLevel:
        Number(formValues.stressLevel) !== Number(initialValues.stressLevel),
      sleepHours:
        Number(formValues.sleepHours) !== Number(initialValues.sleepHours),
      physicalActivity:
        formValues.physicalActivity !== initialValues.physicalActivity,
      socialInteractions:
        formValues.socialInteractions !== initialValues.socialInteractions,
      symptoms: formValues.symptoms !== initialValues.symptoms,
      primarySymptom:
        formValues.primarySymptom !== initialValues.primarySymptom,
      symptomSeverity:
        formValues.symptomSeverity !== initialValues.symptomSeverity,
    };

    return Object.values(changes).some((changed) => changed);
  };

  // Update form validation
  useEffect(() => {
    const validateForm = () => {
      const isValid = Object.keys(errors).length === 0;

      setIsFormValid(isValid);
    };

    validateForm();
  }, [errors]);

  // Update initialValues when loading data
  useEffect(() => {
    const fetchTodayLog = async () => {
      try {
        const today = new Date();
        const response = await api.get("/api/logs/filter", {
          params: {
            period: "custom",
            startDate: format(today, "yyyy-MM-dd"),
            endDate: format(today, "yyyy-MM-dd"),
          },
        });

        if (response.data && response.data.length > 0) {
          const todayLog = response.data[0];
          setExistingLog(todayLog);
          setLastUpdated(new Date(todayLog.updatedAt));

          const formValues = {
            ...todayLog,
            moodLevel: Number(todayLog.moodLevel),
            anxietyLevel: Number(todayLog.anxietyLevel),
            sleepQuality: Number(todayLog.sleepQuality),
            stressLevel: Number(todayLog.stressLevel),
            sleepHours: Number(todayLog.sleepHours),
            symptomSeverity: todayLog.symptomSeverity
              ? Number(todayLog.symptomSeverity)
              : null,
          };

          setInitialValues(formValues);
          reset(formValues);
        }
        setIsFormReady(true);
      } catch (error) {
        console.error("Error fetching today's log:", error);
        setIsFormReady(true);
      }
    };

    fetchTodayLog();
  }, [reset]);

  const formattedLastUpdated = useMemo(() => {
    if (!lastUpdated) return null;
    return format(lastUpdated, "h:mm a");
  }, [lastUpdated]);

  const onSubmit = async (data: LogFormData) => {
    setIsSubmitting(true);

    try {
      if (existingLog) {
        const updateData = {
          moodLevel: Number(data.moodLevel),
          anxietyLevel: Number(data.anxietyLevel),
          sleepHours: Number(data.sleepHours),
          sleepQuality: Number(data.sleepQuality),
          physicalActivity: data.physicalActivity?.trim() || "",
          socialInteractions: data.socialInteractions?.trim() || "",
          stressLevel: Number(data.stressLevel),
          symptoms: data.symptoms?.trim() || "",
          primarySymptom: data.primarySymptom?.trim() || "",
          ...(data.symptoms && data.symptomSeverity
            ? {
                symptomSeverity: Number(data.symptomSeverity),
              }
            : {
                symptomSeverity: undefined, // Don't send the field if there are no symptoms
              }),
        };

        try {
          const response = await api.put(
            `/api/logs/${existingLog.id}`,
            updateData
          );
          setExistingLog(response.data);
          setInitialValues(updateData);
          setLastUpdated(new Date(response.data.updatedAt));
          toast.success("Log entry updated successfully!");
        } catch (error: Error | unknown) {
          if (error instanceof Error) {
            console.error("Server error:", error.message);
          }
          toast.error("Failed to save log entry");
        }
      } else {
        const createData = {
          moodLevel: Number(data.moodLevel),
          anxietyLevel: Number(data.anxietyLevel),
          sleepHours: Number(data.sleepHours),
          sleepQuality: Number(data.sleepQuality),
          physicalActivity: data.physicalActivity?.trim() || "",
          socialInteractions: data.socialInteractions?.trim() || "",
          stressLevel: Number(data.stressLevel),
          symptoms: data.symptoms?.trim() || "",
          primarySymptom: data.primarySymptom?.trim() || "",
          symptomSeverity: data.symptoms ? Number(data.symptomSeverity) : null,
        };

        const response = await api.post("/api/logs", createData);
        setExistingLog(response.data);
        setInitialValues(createData);
        setLastUpdated(new Date());
        toast.success("Log entry saved successfully!");
      }

      setInitialValues(data);
      reset(data);
    } catch (error: Error | unknown) {
      if (error instanceof Error) {
        console.error("Submit error:", error.message);
      }
      toast.error("Failed to save log entry");
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
          <p className="mt-1 text-sm text-gray-500">
            {format(new Date(), "EEEE, MMMM d, yyyy")}
          </p>
        </div>
        {formattedLastUpdated && (
          <span className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
            Last updated: {formattedLastUpdated}
          </span>
        )}
      </div>

      <form
        onSubmit={handleSubmit(async (data) => {
          if (!hasChanges()) {
            return;
          }

          try {
            await onSubmit(data);
          } catch (error) {
            console.error("Submit error:", error);
          }
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
          disabled={Boolean(
            isSubmitting || (!hasChanges() && existingLog) || !isFormValid
          )}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-medium rounded-lg 
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
            disabled:opacity-50 disabled:cursor-not-allowed
            flex items-center justify-center transition-colors"
        >
          {isSubmitting ? (
            <>
              <LoadingSpinner />
              {existingLog ? "Updating..." : "Saving..."}
            </>
          ) : existingLog ? (
            "Update Log Entry"
          ) : (
            "Save Log Entry"
          )}
        </button>
      </form>
    </div>
  );
}
