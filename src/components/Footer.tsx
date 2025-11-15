import config from "@/lib/config";

const currentYear = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{config.project.name}</h3>
          <p className="text-sm text-muted-foreground">
            {config.project.description}
          </p>
        </div>

        <div className="mt-12 border-t pt-8">
          <div className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              © {currentYear} {config.project.name}. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
