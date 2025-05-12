import Image from "next/image";
import D3EntityGraph, { EntityNode, D3GraphDataContainer } from '../components/EntitiesVisualization'; 

const sampleJsonDataString = `{
    "nodes": [
      {
        "id": "E001",
        "organization_id": "ORG_ALPHA_TECH",
        "name": "Alpha Technologies Inc.",
        "created_at": "2025-01-15T09:30:00Z",
        "updated_at": "2025-03-10T11:00:00Z",
        "source_system": "CRM_Main",
        "source_id": "CRM_100567"
      },
      {
        "id": "E002",
        "organization_id": "ORG_ALPHA_TECH",
        "name": "Alpha Tech (Legacy)",
        "created_at": "2024-11-20T14:00:00Z",
        "updated_at": "2025-02-01T16:45:00Z",
        "source_system": "AcquisitionDB_Delta",
        "source_id": "DLT_A0034"
      },
      {
        "id": "E003",
        "organization_id": "ORG_ALPHA_TECH",
        "name": "Support Contact - AlphaTech",
        "created_at": "2025-02-01T10:00:00Z",
        "updated_at": "2025-04-05T13:20:00Z",
        "source_system": "SupportPortal",
        "source_id": "SP_User_9908"
      },
      {
        "id": "E004",
        "organization_id": "ORG_BETA_SOLUTIONS",
        "name": "Beta Innovations Ltd.",
        "created_at": "2025-01-20T11:00:00Z",
        "updated_at": "2025-01-20T11:00:00Z",
        "source_system": "CRM_Main",
        "source_id": "CRM_100992"
      },
      {
        "id": "E005",
        "organization_id": "ORG_BETA_SOLUTIONS",
        "name": "Beta Support Team",
        "created_at": "2025-02-05T09:15:00Z",
        "updated_at": "2025-03-20T14:30:00Z",
        "source_system": "SupportPortal",
        "source_id": "SP_Team_Beta"
      },
      {
        "id": "E006",
        "organization_id": "ORG_GAMMA_CORP",
        "name": "Gamma Corporation",
        "created_at": "2025-01-30T11:45:00Z",
        "updated_at": "2025-04-01T16:20:00Z",
        "source_system": "CRM_Main",
        "source_id": "CRM_101234"
      }
    ],
    "links": [
      {
        "source": "E001",
        "target": "E002",
        "value": 95.5,
        "weight": 85
      },
      {
        "source": "E001",
        "target": "E003",
        "value": 25.0,
        "weight": 30
      },
      {
        "source": "E001",
        "target": "E006",
        "value": 50.0,
        "weight": 45
      },
      {
        "source": "E004",
        "target": "E005",
        "value": 75.0,
        "weight": 65
      },
      {
        "source": "E004",
        "target": "E006",
        "value": 40.0,
        "weight": 35
      },
      {
        "source": "E002",
        "target": "E006",
        "value": 60.0,
        "weight": 55
      }
    ]
  }`;

export default function Home() {
  // Parse the JSON string to get the data
  const graphData: D3GraphDataContainer = JSON.parse(sampleJsonDataString);
  
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        
       
        <D3EntityGraph 
          nodesData={graphData.nodes} 
          linksData={graphData.links}
          width={800} 
          height={500} 
        />
        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            Deploy now
          </a>
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read our docs
          </a>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}