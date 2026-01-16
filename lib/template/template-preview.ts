// Template preview utilities
// Add this to lib/template-preview.ts

export interface TemplateVariables {
  // Client variables
  clientName?: string;
  clientEmail?: string;
  clientCompany?: string;
  
  // Business/Developer variables
  businessName?: string;
  businessAddress?: string;
  developerName?: string;
  developerEmail?: string;
  
  // Project variables
  projectName?: string;
  projectDescription?: string;
  totalAmount?: string;
  milestones?: string;
  
  // Invoice variables
  invoiceNumber?: string;
  invoiceDate?: string;
  dueDate?: string;
  lineItems?: string;
  subtotal?: string;
  taxRate?: string;
  taxAmount?: string;
  total?: string;
  
  // General
  date?: string;
  
  // Allow custom variables
  [key: string]: string | undefined;
}

// Sample data for preview
export const sampleContractVariables: TemplateVariables = {
  // camelCase versions
  clientName: "Sarah Mitchell",
  clientEmail: "sarah@acmecorp.com",
  clientCompany: "Acme Corporation",
  businessName: "DevStudio LLC",
  businessAddress: "123 Tech Lane, San Francisco, CA 94102",
  developerName: "Alex Developer",
  developerEmail: "alex@devstudio.io",
  projectName: "E-Commerce Platform Redesign",
  projectDescription: "Complete redesign and development of the client's e-commerce platform, including new product catalog, checkout flow, and admin dashboard.",
  totalAmount: "$12,500.00",
  milestones: `1. Discovery & Planning — $2,500.00
2. UI/UX Design — $3,000.00
3. Frontend Development — $4,000.00
4. Backend Integration — $2,000.00
5. Testing & Launch — $1,000.00`,
  date: new Date().toLocaleDateString("en-US", { 
    year: "numeric", 
    month: "long", 
    day: "numeric" 
  }),
  
  // snake_case versions (for system templates)
  client_name: "Sarah Mitchell",
  client_email: "sarah@acmecorp.com",
  client_company: "Acme Corporation",
  business_name: "DevStudio LLC",
  business_address: "123 Tech Lane, San Francisco, CA 94102",
  developer_name: "Alex Developer",
  developer_email: "alex@devstudio.io",
  project_name: "E-Commerce Platform Redesign",
  project_description: "Complete redesign and development of the client's e-commerce platform, including new product catalog, checkout flow, and admin dashboard.",
  scope_description: "Complete redesign and development of the client's e-commerce platform, including new product catalog, checkout flow, and admin dashboard.",
  total_amount: "$12,500.00",
  start_date: new Date().toLocaleDateString("en-US", { 
    year: "numeric", 
    month: "long", 
    day: "numeric" 
  }),
  end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { 
    year: "numeric", 
    month: "long", 
    day: "numeric" 
  }),
};

export const sampleInvoiceVariables: TemplateVariables = {
  // camelCase versions
  clientName: "Sarah Mitchell",
  clientEmail: "sarah@acmecorp.com",
  clientCompany: "Acme Corporation",
  businessName: "DevStudio LLC",
  businessAddress: "123 Tech Lane, San Francisco, CA 94102",
  invoiceNumber: "INV-2601-042",
  invoiceDate: new Date().toLocaleDateString("en-US", { 
    year: "numeric", 
    month: "long", 
    day: "numeric" 
  }),
  dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { 
    year: "numeric", 
    month: "long", 
    day: "numeric" 
  }),
  lineItems: `| Website Development | 40 hrs | $150.00 | $6,000.00 |
| API Integration | 15 hrs | $150.00 | $2,250.00 |
| Database Setup | 8 hrs | $150.00 | $1,200.00 |
| Deployment & Config | 4 hrs | $150.00 | $600.00 |`,
  subtotal: "$10,050.00",
  taxRate: "8.25",
  taxAmount: "$829.13",
  total: "$10,879.13",
  projectName: "E-Commerce Platform Redesign",
  
  // snake_case versions (for system templates)
  client_name: "Sarah Mitchell",
  client_email: "sarah@acmecorp.com",
  client_company: "Acme Corporation",
  business_name: "DevStudio LLC",
  business_address: "123 Tech Lane, San Francisco, CA 94102",
  invoice_number: "INV-2601-042",
  invoice_date: new Date().toLocaleDateString("en-US", { 
    year: "numeric", 
    month: "long", 
    day: "numeric" 
  }),
  due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { 
    year: "numeric", 
    month: "long", 
    day: "numeric" 
  }),
  line_items: `| Website Development | 40 hrs | $150.00 | $6,000.00 |
| API Integration | 15 hrs | $150.00 | $2,250.00 |
| Database Setup | 8 hrs | $150.00 | $1,200.00 |
| Deployment & Config | 4 hrs | $150.00 | $600.00 |`,
  tax_rate: "8.25",
  tax_amount: "$829.13",
  project_name: "E-Commerce Platform Redesign",
};

/**
 * Interpolate template variables with provided values
 * @param content - Template content with {{variable}} placeholders
 * @param variables - Object with variable values
 * @param highlightMissing - Whether to highlight missing variables
 * @returns Interpolated content
 */
export function interpolateTemplate(
  content: string, 
  variables: TemplateVariables,
  highlightMissing: boolean = false
): string {
  return content.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
    const value = variables[varName];
    if (value !== undefined && value !== "") {
      return value;
    }
    // Return highlighted placeholder if missing, otherwise keep original
    return highlightMissing 
      ? `⚠️ {{${varName}}}` 
      : match;
  });
}

/**
 * Extract all variable names from a template
 * @param content - Template content
 * @returns Array of unique variable names
 */
export function extractVariables(content: string): string[] {
  const matches = content.match(/\{\{(\w+)\}\}/g) || [];
  const varNames = matches.map(m => m.replace(/\{\{|\}\}/g, ""));
  return [...new Set(varNames)]; // Remove duplicates
}

/**
 * Get sample variables based on template type
 */
export function getSampleVariables(type: "contract" | "invoice"): TemplateVariables {
  return type === "contract" ? sampleContractVariables : sampleInvoiceVariables;
}

/**
 * Build variables from actual client/project data
 * Outputs both camelCase and snake_case versions for compatibility
 */
export function buildVariablesFromData(data: {
  client?: {
    name?: string;
    email?: string;
    company?: string;
  };
  project?: {
    name?: string;
    description?: string;
    totalAmount?: number;
    milestones?: Array<{ name: string; amount: number }>;
    startDate?: Date;
    endDate?: Date;
  };
  business?: {
    name?: string;
    address?: string;
  };
  invoice?: {
    number?: string;
    lineItems?: Array<{ description: string; quantity: number; unitPrice: number; amount: number }>;
    subtotal?: number;
    taxRate?: number;
    tax?: number;
    total?: number;
    dueDate?: Date;
  };
}): TemplateVariables {
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { 
      year: "numeric", 
      month: "long", 
      day: "numeric" 
    });
  };

  const currentDate = formatDate(new Date());

  const variables: TemplateVariables = {
    date: currentDate,
  };

  // Client variables (both formats)
  if (data.client) {
    // camelCase
    variables.clientName = data.client.name;
    variables.clientEmail = data.client.email;
    variables.clientCompany = data.client.company;
    // snake_case
    variables.client_name = data.client.name;
    variables.client_email = data.client.email;
    variables.client_company = data.client.company;
  }

  // Business variables (both formats)
  if (data.business) {
    // camelCase
    variables.businessName = data.business.name;
    variables.businessAddress = data.business.address;
    variables.developerName = data.business.name;
    // snake_case
    variables.business_name = data.business.name;
    variables.business_address = data.business.address;
    variables.developer_name = data.business.name;
  }

  // Project variables (both formats)
  if (data.project) {
    // camelCase
    variables.projectName = data.project.name;
    variables.projectDescription = data.project.description;
    // snake_case
    variables.project_name = data.project.name;
    variables.project_description = data.project.description;
    variables.scope_description = data.project.description;
    
    if (data.project.totalAmount !== undefined) {
      const formatted = formatCurrency(data.project.totalAmount);
      variables.totalAmount = formatted;
      variables.total_amount = formatted;
    }
    if (data.project.milestones) {
      const formatted = data.project.milestones
        .map((m, i) => `${i + 1}. ${m.name} — ${formatCurrency(m.amount)}`)
        .join("\n");
      variables.milestones = formatted;
    }
    if (data.project.startDate) {
      const formatted = formatDate(data.project.startDate);
      variables.startDate = formatted;
      variables.start_date = formatted;
    }
    if (data.project.endDate) {
      const formatted = formatDate(data.project.endDate);
      variables.endDate = formatted;
      variables.end_date = formatted;
    }
  }

  // Invoice variables (both formats)
  if (data.invoice) {
    // camelCase
    variables.invoiceNumber = data.invoice.number;
    // snake_case
    variables.invoice_number = data.invoice.number;
    
    if (data.invoice.dueDate) {
      const formatted = formatDate(data.invoice.dueDate);
      variables.dueDate = formatted;
      variables.due_date = formatted;
    }
    
    const invoiceDateFormatted = currentDate;
    variables.invoiceDate = invoiceDateFormatted;
    variables.invoice_date = invoiceDateFormatted;
    
    if (data.invoice.lineItems) {
      const formatted = data.invoice.lineItems
        .map(item => `| ${item.description} | ${item.quantity} | ${formatCurrency(item.unitPrice)} | ${formatCurrency(item.amount)} |`)
        .join("\n");
      variables.lineItems = formatted;
      variables.line_items = formatted;
    }
    if (data.invoice.subtotal !== undefined) {
      variables.subtotal = formatCurrency(data.invoice.subtotal);
    }
    if (data.invoice.taxRate !== undefined) {
      const formatted = data.invoice.taxRate.toString();
      variables.taxRate = formatted;
      variables.tax_rate = formatted;
    }
    if (data.invoice.tax !== undefined) {
      const formatted = formatCurrency(data.invoice.tax);
      variables.taxAmount = formatted;
      variables.tax_amount = formatted;
    }
    if (data.invoice.total !== undefined) {
      variables.total = formatCurrency(data.invoice.total);
    }
  }

  return variables;
}

/**
 * Variable definitions with descriptions for UI
 */
export const variableDefinitions: Record<string, { description: string; example: string; types: ("contract" | "invoice")[] }> = {
  // camelCase versions
  clientName: { description: "Client's full name", example: "Sarah Mitchell", types: ["contract", "invoice"] },
  clientEmail: { description: "Client's email address", example: "sarah@acme.com", types: ["contract", "invoice"] },
  clientCompany: { description: "Client's company name", example: "Acme Corporation", types: ["contract", "invoice"] },
  businessName: { description: "Your business name", example: "DevStudio LLC", types: ["contract", "invoice"] },
  businessAddress: { description: "Your business address", example: "123 Tech Lane, SF", types: ["contract", "invoice"] },
  developerName: { description: "Developer's name (alias for businessName)", example: "Alex Developer", types: ["contract"] },
  developerEmail: { description: "Developer's email", example: "alex@dev.io", types: ["contract"] },
  projectName: { description: "Project title", example: "E-Commerce Redesign", types: ["contract", "invoice"] },
  projectDescription: { description: "Project description/scope", example: "Complete redesign...", types: ["contract"] },
  totalAmount: { description: "Total project value", example: "$12,500.00", types: ["contract"] },
  milestones: { description: "Formatted milestone list", example: "1. Design — $3,000", types: ["contract"] },
  date: { description: "Current date", example: "January 16, 2026", types: ["contract", "invoice"] },
  invoiceNumber: { description: "Invoice number", example: "INV-2601-042", types: ["invoice"] },
  invoiceDate: { description: "Invoice creation date", example: "January 16, 2026", types: ["invoice"] },
  dueDate: { description: "Payment due date", example: "January 30, 2026", types: ["invoice"] },
  lineItems: { description: "Invoice line items table", example: "| Item | Qty | Rate | Amount |", types: ["invoice"] },
  subtotal: { description: "Subtotal before tax", example: "$10,000.00", types: ["invoice"] },
  taxRate: { description: "Tax percentage", example: "8.25", types: ["invoice"] },
  taxAmount: { description: "Calculated tax amount", example: "$825.00", types: ["invoice"] },
  total: { description: "Total including tax", example: "$10,825.00", types: ["invoice"] },
  startDate: { description: "Project start date", example: "January 16, 2026", types: ["contract"] },
  endDate: { description: "Project end date", example: "April 16, 2026", types: ["contract"] },
  
  // snake_case versions (aliases)
  client_name: { description: "Client's full name (snake_case)", example: "Sarah Mitchell", types: ["contract", "invoice"] },
  client_email: { description: "Client's email (snake_case)", example: "sarah@acme.com", types: ["contract", "invoice"] },
  client_company: { description: "Client's company (snake_case)", example: "Acme Corporation", types: ["contract", "invoice"] },
  business_name: { description: "Your business name (snake_case)", example: "DevStudio LLC", types: ["contract", "invoice"] },
  business_address: { description: "Your address (snake_case)", example: "123 Tech Lane", types: ["contract", "invoice"] },
  developer_name: { description: "Developer's name (snake_case)", example: "Alex Developer", types: ["contract"] },
  developer_email: { description: "Developer's email (snake_case)", example: "alex@dev.io", types: ["contract"] },
  project_name: { description: "Project title (snake_case)", example: "E-Commerce Redesign", types: ["contract", "invoice"] },
  project_description: { description: "Project scope (snake_case)", example: "Complete redesign...", types: ["contract"] },
  scope_description: { description: "Project scope (alias)", example: "Complete redesign...", types: ["contract"] },
  total_amount: { description: "Total value (snake_case)", example: "$12,500.00", types: ["contract"] },
  start_date: { description: "Project start (snake_case)", example: "January 16, 2026", types: ["contract"] },
  end_date: { description: "Project end (snake_case)", example: "April 16, 2026", types: ["contract"] },
  invoice_number: { description: "Invoice number (snake_case)", example: "INV-2601-042", types: ["invoice"] },
  invoice_date: { description: "Invoice date (snake_case)", example: "January 16, 2026", types: ["invoice"] },
  due_date: { description: "Due date (snake_case)", example: "January 30, 2026", types: ["invoice"] },
  line_items: { description: "Line items (snake_case)", example: "| Item | Qty | Rate |", types: ["invoice"] },
  tax_rate: { description: "Tax rate (snake_case)", example: "8.25", types: ["invoice"] },
  tax_amount: { description: "Tax amount (snake_case)", example: "$825.00", types: ["invoice"] },
};

/**
 * Get variable definitions for a specific template type
 * Filters out snake_case duplicates for cleaner UI display
 */
export function getVariablesForType(type: "contract" | "invoice") {
  // Only show camelCase versions in the reference UI (snake_case are aliases)
  const excludeSnakeCase = [
    "client_name", "client_email", "client_company",
    "business_name", "business_address", "developer_name", "developer_email",
    "project_name", "project_description", "scope_description", "total_amount",
    "start_date", "end_date", "invoice_number", "invoice_date", "due_date",
    "line_items", "tax_rate", "tax_amount"
  ];
  
  return Object.entries(variableDefinitions)
    .filter(([name, def]) => def.types.includes(type) && !excludeSnakeCase.includes(name))
    .map(([name, def]) => ({ name, ...def }));
}