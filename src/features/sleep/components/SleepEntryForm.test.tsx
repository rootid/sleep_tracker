import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SleepEntryForm } from './SleepEntryForm';

describe('SleepEntryForm', () => {
  const mockOnAddEntry = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with default values', () => {
    render(<SleepEntryForm onAddEntry={mockOnAddEntry} />);
    
    // Check title
    expect(screen.getByText('Log Last Night')).toBeInTheDocument();
    
    // Check inputs exist
    expect(screen.getByLabelText(/Target Date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Bed Time/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Wake Time/i)).toBeInTheDocument();
    
    // Check submit button
    expect(screen.getByRole('button', { name: /Log Sleep & Earn XP/i })).toBeInTheDocument();
  });

  it('submits form with correct data when bed time is before wake time', async () => {
    render(<SleepEntryForm onAddEntry={mockOnAddEntry} />);
    
    const dateInput = screen.getByLabelText(/Target Date/i);
    const bedTimeInput = screen.getByLabelText(/Bed Time/i);
    const wakeTimeInput = screen.getByLabelText(/Wake Time/i);
    const submitBtn = screen.getByRole('button', { name: /Log Sleep & Earn XP/i });

    // Set values (Bed time 22:00, Wake time 06:00 is default)
    // Meaning bed time is treated as previous day
    fireEvent.change(dateInput, { target: { value: '2023-10-25' } });
    fireEvent.change(bedTimeInput, { target: { value: '22:00' } });
    fireEvent.change(wakeTimeInput, { target: { value: '06:00' } });
    
    fireEvent.click(submitBtn);

    // Bed time should be 2023-10-24T22:00:00Z
    // Wake time should be 2023-10-25T06:00:00Z
    await waitFor(() => {
      expect(mockOnAddEntry).toHaveBeenCalledWith(
        '2023-10-25',
        '2023-10-24T22:00:00Z',
        '2023-10-25T06:00:00Z'
      );
    });
  });

  it('submits form with correct data when bed time is after midnight (same day)', async () => {
    render(<SleepEntryForm onAddEntry={mockOnAddEntry} />);
    
    const dateInput = screen.getByLabelText(/Target Date/i);
    const bedTimeInput = screen.getByLabelText(/Bed Time/i);
    const wakeTimeInput = screen.getByLabelText(/Wake Time/i);
    const submitBtn = screen.getByRole('button', { name: /Log Sleep & Earn XP/i });

    // Set values (Bed time 01:00, Wake time 09:00)
    // Both same day
    fireEvent.change(dateInput, { target: { value: '2023-10-25' } });
    fireEvent.change(bedTimeInput, { target: { value: '01:00' } });
    fireEvent.change(wakeTimeInput, { target: { value: '09:00' } });
    
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockOnAddEntry).toHaveBeenCalledWith(
        '2023-10-25',
        '2023-10-25T01:00:00Z',
        '2023-10-25T09:00:00Z'
      );
    });
  });
});
