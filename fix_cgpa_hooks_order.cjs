const fs = require('fs');
let file = fs.readFileSync('src/components/CGPACalculator.tsx', 'utf8');

// We need to extract the auth guard, and the state variables at the bottom, and reorder them.
// First, extract the state variables from line 173.

const stateBlock = `  const [scale, setScale] = useState<5 | 4>(5);
  const [semesters, setSemesters] = useState<Semester[]>([
    {
      id: 'sem-1',
      name: 'Year 1 - First Semester',
      courses: [
        { id: 'c-1', code: 'GST111', units: 2, grade: 'A' },
        { id: 'c-2', code: 'MTH101', units: 3, grade: 'B' },
        { id: 'c-3', code: 'CHM101', units: 3, grade: 'A' },
        { id: 'c-4', code: 'PHY101', units: 3, grade: 'C' }
      ]
    }
  ]);
  const [activeSemesterId, setActiveSemesterId] = useState<string>('sem-1');
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [newSemName, setNewSemName] = useState('');`;

file = file.replace(stateBlock, '');

// Now extract the auth guard.
const authGuardStart = `  // If user is not logged in, show Auth Guard requiring Sign Up / Login`;
const authGuardEndStr = `              Log In
            </button>
          </div>
        </div>
      </div>
    );
  }`;

const startIndex = file.indexOf(authGuardStart);
const endIndex = file.indexOf(authGuardEndStr) + authGuardEndStr.length;

const authGuardBlock = file.substring(startIndex, endIndex);
file = file.substring(0, startIndex) + file.substring(endIndex);

// Now, insert the state block right before the `useEffect` hooks.
const useEffectIndex = file.indexOf('  useEffect(() => {');
file = file.substring(0, useEffectIndex) + stateBlock + '\n\n' + file.substring(useEffectIndex);

// Then insert the auth guard right after the useEffect hooks, before the helper functions.
const helperIndex = file.indexOf('  // Grade point mapping');
file = file.substring(0, helperIndex) + authGuardBlock + '\n\n' + file.substring(helperIndex);

fs.writeFileSync('src/components/CGPACalculator.tsx', file);
console.log("Hooks reordered.");
