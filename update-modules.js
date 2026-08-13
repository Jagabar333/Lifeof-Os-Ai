const fs = require('fs');
const path = require('path');

const updates = [
  {
    module: 'apps/api/src/modules/finance/finance.module.ts',
    service: 'apps/api/src/modules/finance/finance.service.ts',
    entities: ['FinanceAccount', 'FinanceTransaction'],
    files: {
      'finance-account.schema': 'FinanceAccount',
      'finance-transaction.schema': 'FinanceTransaction'
    }
  },
  {
    module: 'apps/api/src/modules/health/health.module.ts',
    service: 'apps/api/src/modules/health/health.service.ts',
    entities: ['HealthMetric'],
    files: {
      'health-metric.schema': 'HealthMetric'
    }
  },
  {
    module: 'apps/api/src/modules/calendar/calendar.module.ts',
    service: 'apps/api/src/modules/calendar/calendar.service.ts',
    entities: ['CalendarEvent'],
    files: {
      'calendar-event.schema': 'CalendarEvent'
    },
  }
  {
    module: 'apps/api/src/modules/goals/goals.module.ts',
    service: 'apps/api/src/modules/goals/goals.service.ts',
    entities: ['Goal'],
    files: {
      'goal.schema': 'Goal'
    }
  }
];

updates.forEach(({ module, service, entities, files }) => {
  // Update Module  
  const modPath = path.join(__dirname, module);
  let modContent = fs.readFileSync(modPath, 'utf8');
  
  if (!modContent.includes('MongooseModule.forFeature')) {
    const importMongoose = 'import { MongooseModule } from "@nestjs/mongoose";\n';
    let importSchemas = '';
    let featureArray = [];
    
    for (const [file, entity] of Object.entries(files)) {
      importSchemas += \`import { \${entity}, \${entity}Schema } from "./schemas/\${file}";\\n\`;
      featureArray.push(\`{ name: \${entity}.name, schema: \${entity}Schema }\`);
    }

    modContent = importMongoose + importSchemas + modContent;
    
    const importStr = \`imports: [MongooseModule.forFeature([\${featureArray.join(', ')}])],\n  controllers\`;
    modContent = modContent.replace('controllers', importStr);
    
    fs.writeFileSync(modPath, modContent);
    console.log('Updated', modPath);
  }

  // Update Service
  const srvPath = path.join(__dirname, service);
  let srvContent = fs.readFileSync(srvPath, 'utf8');
  
  if (srvContent.includes('ConfigService')) {
    srvContent = srvContent.replace('import { ConfigService } from "@nestjs/config";', 'import { InjectModel } from "@nestjs/mongoose";\\nimport { Model } from "mongoose";');
    
    let importSchemas = '';
    let ctorParams = [];
    for (const [file, entity] of Object.entries(files)) {
      importSchemas += \`import { \${entity}, \${entity}Document } from "./schemas/\${file}";\\n\`;
      ctorParams.push(\`@InjectModel(\${entity}.name) \${entity.toLowerCase()}Model: Model<\${entity}Document>\`);
    }

    // Replace the shared import
    srvContent = srvContent.replace(/import type \{.*?\} from "@lifeos\/shared";/g, importSchemas.trim());

    // Fix BaseCrudService generic
    const mainEntity = entities[0];
    srvContent = srvContent.replace(\`BaseCrudService<\${mainEntity}>\`, \`BaseCrudService<\${mainEntity}Document>\`);

    // Fix constructor
    const oldCtor = \`constructor(config: ConfigService) {
    super(config, \`;
    
    const newCtor = \`constructor(${ctorParams.join(', ')}) {
    super(${mainEntity.toLowerCase()}Model, \`;
    
    srvContent = srvContent.replace(oldCtor, newCtor);
    
    // Replace any remaining this.supabase
    srvContent = srvContent.replace(/this\.supabase/g, '/* TODO: REWRITE SUPABASE QUERY */');

    fs.writeFileSync(srvPath, srvContent);
    console.log('Updated', srvPath);
  }
    }