import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ToolsGrid from './ToolsGrid';

describe('ToolsGrid Component', () => {
  it('renders title and tool cards correctly', () => {
    render(
      <BrowserRouter>
        <ToolsGrid />
      </BrowserRouter>
    );

    expect(screen.getByText(/Explore/i)).toBeInTheDocument();
    expect(screen.getAllByText(/CampusAI/i).length).toBeGreaterThan(0);
    expect(screen.getByText('Aggregate Calculator')).toBeInTheDocument();
    expect(screen.getByText('Syllabus Finder')).toBeInTheDocument();
    expect(screen.getByText('UNILAG Calculator')).toBeInTheDocument();
    expect(screen.getByText('Admission Checklist')).toBeInTheDocument();
  });
});
