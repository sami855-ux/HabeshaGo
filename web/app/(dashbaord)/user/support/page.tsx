import  CustomerSupport  from "@/components/user-dashboard/Customer-Support";

export default function App() {
  return (
    <div className="size-full bg-background">
      {/* Demo page content */}
      <div className="container mx-auto p-8">
        <h1 className="mb-4">Welcome to Our Service</h1>
        <p className="text-muted-foreground mb-8">
          This is a HabeshaGo Support Page. Click the support chat button in the bottom right
          corner to get help.
        </p>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="p-6 border border-border rounded-lg bg-card">
            <h3 className="mb-2">Quick Help</h3>
            <p className="text-sm text-muted-foreground">
              Our support team is available to assist you with any questions.
            </p>
          </div>
          <div className="p-6 border border-border rounded-lg bg-card">
            <h3 className="mb-2">Fast Response</h3>
            <p className="text-sm text-muted-foreground">
              Get answers in real-time from our support agents.
            </p>
          </div>
          <div className="p-6 border border-border rounded-lg bg-card">
            <h3 className="mb-2">File Sharing</h3>
            <p className="text-sm text-muted-foreground">
              Share screenshots, PDFs, and documents easily.
            </p>
          </div>
        </div>
      </div>

      {/* Customer Support Chat Widget */}
      <CustomerSupport />
    </div>
  );
}
