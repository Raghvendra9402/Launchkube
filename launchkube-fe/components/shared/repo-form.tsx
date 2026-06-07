"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSendUrl } from "@/hooks/use-service";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDownIcon, MinusIcon } from "lucide-react";
import { Controller, ControllerRenderProps, useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
  repoUrl: z.url("Repo URL needed.").min(1),
  preset: z.enum(["nextjs", "nodejs"]),
  envVariables: z
    .array(
      z.object({
        key: z
          .string()
          .min(1, "Key is required")
          .regex(/^[A-Z_]+$/, "Use uppercase env keys like API_KEY"),
        value: z.string().min(1, "Value cannot be empty."),
      }),
    )
    .optional(),
});

export function RepoForm() {
  const { mutate, isPending } = useSendUrl();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      repoUrl: "",
      preset: undefined,
      envVariables: [],
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    mutate(values);
  };

  const handlePaste = (
    e: React.ClipboardEvent<HTMLInputElement>,
    index: number,
    field: ControllerRenderProps<z.infer<typeof formSchema>, "envVariables">,
  ) => {
    const pasted = e.clipboardData.getData("text");

    const lines = pasted
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.some((l) => l.includes("="))) {
      e.preventDefault();

      const parsed = lines.map((line) => {
        const eqIndex = line.indexOf("=");
        if (eqIndex === -1) return { key: line, value: "" };
        return {
          key: line.slice(0, eqIndex).trim(),
          value: line.slice(eqIndex + 1).trim(),
        };
      });

      const existing = [...(field.value || [])];
      existing.splice(index, 1, ...parsed);
      field.onChange(existing);
    }
  };
  return (
    <Card className="w-full sm:max-w-xl">
      <CardHeader>
        <CardTitle>Deploy your Repository</CardTitle>
        <CardDescription>
          it will deploy your Repository content to the internet
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="repo-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="repoUrl"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="repo-form-title">
                    Repository URL
                  </FieldLabel>
                  <Input
                    {...field}
                    id="repo-form-title"
                    aria-invalid={fieldState.invalid}
                    placeholder="Enter your repo url that you want to deploy."
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="preset"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="repo-form-title">
                    Repository Preset
                  </FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger aria-invalid={fieldState.invalid}>
                      <SelectValue placeholder="Select project type" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="nextjs">Next.js</SelectItem>
                        <SelectItem value="nodejs">Node.js</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Collapsible className="rounded-md data-[state=open]:bg-muted">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="group w-full" type="button">
                  Environment Variables
                  <ChevronDownIcon className="ml-auto group-data-[state=open]:rotate-180" />
                </Button>
              </CollapsibleTrigger>

              <CollapsibleContent className="flex flex-col gap-3 p-3">
                <Controller
                  name="envVariables"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      {field.value?.map((env, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={env.key}
                            onChange={(e) => {
                              const updated = [...(field.value || [])];
                              updated[index] = {
                                ...updated[index],
                                key: e.target.value,
                              };
                              field.onChange(updated);
                            }}
                            placeholder="KEY"
                            autoComplete="off"
                            onPaste={(e) => handlePaste(e, index, field)}
                          />
                          <Input
                            value={env.value}
                            onChange={(e) => {
                              const updated = [...(field.value || [])];
                              updated[index] = {
                                ...updated[index],
                                value: e.target.value,
                              };
                              field.onChange(updated);
                            }}
                            placeholder="Value"
                            autoComplete="off"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const updated = (field.value || []).filter(
                                (_, i) => i !== index,
                              );
                              field.onChange(updated);
                            }}
                          >
                            <MinusIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}

                      <Button
                        type="button"
                        size="sm"
                        onClick={() => {
                          field.onChange([
                            ...(field.value || []),
                            { key: "", value: "" },
                          ]);
                        }}
                      >
                        + Add Variable
                      </Button>

                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </CollapsibleContent>
            </Collapsible>
            {form.watch("preset") === "nextjs" && (
              <p className="text-xs text-muted-foreground font-mono px-1">
                💡 If deploying a Next.js app, add{" "}
                <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
                  output: &quot;standalone&quot;
                </code>{" "}
                to your{" "}
                <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
                  next.config.ts
                </code>{" "}
                for Docker compatibility.
              </p>
            )}
            {form.watch("preset") === "nodejs" && (
              <p className="text-xs text-muted-foreground font-mono px-1">
                💡 For Node.js apps, ensure your{" "}
                <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
                  package.json
                </code>{" "}
                includes a{" "}
                <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
                  build
                </code>{" "}
                script and outputs compiled files to{" "}
                <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
                  dist/
                </code>
                . Your production start command should run the compiled output
                (for example,{" "}
                <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
                  node dist/index.js
                </code>
                ).
              </p>
            )}
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Field orientation="horizontal">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>
          <Button type="submit" form="repo-form" disabled={isPending}>
            Submit
          </Button>
        </Field>
      </CardFooter>
    </Card>
  );
}
