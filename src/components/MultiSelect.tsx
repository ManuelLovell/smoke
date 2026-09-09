import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import tw from 'twin.macro';
import { ChevronDown, X } from 'lucide-react';
import { Translation } from '../i18n/Translation';

interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  value: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  theme?: any;
}

const SelectContainer = styled.div<{ theme: any }>`
  ${tw`relative`}
  width: 100%;
`;

const SelectInput = styled.div<{ theme: any; disabled?: boolean }>`
  ${tw`flex flex-wrap gap-1 p-1 bg-gray-900 border border-gray-700 rounded cursor-pointer`}
  min-height: 32px;
  opacity: ${props => props.disabled ? 0.5 : 1};
  pointer-events: ${props => props.disabled ? 'none' : 'auto'};
  
  &:focus-within {
    ${tw`border-purple-500 bg-gray-800`}
  }
`;

const Tag = styled.div<{ theme: any }>`
  ${tw`flex items-center gap-1 p-1 bg-purple-600 text-white text-sm rounded`}
  white-space: nowrap;
`;

const TagRemove = styled.button<{ theme: any }>`
  ${tw`flex items-center justify-center ml-1 hover:bg-purple-700 rounded`}
  width: 16px;
  height: 16px;
  padding: 0;
  border: none;
  background: transparent;
  color: white;
  cursor: pointer;
`;

const Dropdown = styled.div<{ theme: any; $isOpen: boolean }>`
  ${tw`absolute w-full left-0 right-0 bg-gray-900 border border-gray-700 rounded mt-1 z-50`}
  display: ${props => props.$isOpen ? 'block' : 'none'};
  max-height: 200px;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
`;

const Option = styled.div<{ theme: any; $isSelected: boolean }>`
  ${tw`px-3 py-2 cursor-pointer hover:bg-gray-800`}
  background-color: ${props => props.$isSelected ? 'rgba(168, 85, 247, 0.2)' : 'transparent'};
  color: ${props => props.$isSelected ? '#a855f7' : '#ffffff'};
  font-weight: ${props => props.$isSelected ? '600' : 'normal'};
  
  &:hover {
    background-color: ${props => props.$isSelected ? 'rgba(168, 85, 247, 0.3)' : 'rgba(168, 85, 247, 0.1)'};
  }
`;

const Placeholder = styled.span<{ theme: any }>`
  ${tw`text-gray-500 py-1`}
  font-size: 0.875rem;
`;

const ChevronWrapper = styled.div`
  margin-left: auto;
  color: #999;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = Translation.t('common.selectItemsPlaceholder'),
  disabled = false,
  theme
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleOption = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter(v => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const handleRemoveTag = (e: React.MouseEvent, optionValue: string) => {
    e.stopPropagation();
    onChange(value.filter(v => v !== optionValue));
  };

  const selectedLabels = value
    .map(v => options.find(opt => opt.value === v)?.label)
    .filter(Boolean) as string[];

  const renderContent = () => {
    return (
      <>
        {selectedLabels.length === 0 ? (
          <Placeholder theme={theme}>{placeholder}</Placeholder>
        ) : (
          selectedLabels.map((label, idx) => (
            <Tag key={value[idx]} theme={theme}>
              {label}
              <TagRemove
                theme={theme}
                onClick={(e) => handleRemoveTag(e, value[idx])}
                type="button"
              >
                <X size={12} />
              </TagRemove>
            </Tag>
          ))
        )}
      </>
    );
  };

  return (
    <SelectContainer ref={containerRef} theme={theme}>
      <SelectInput
        theme={theme}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        {renderContent()}
        <ChevronWrapper>
          <ChevronDown size={16} />
        </ChevronWrapper>
      </SelectInput>

      <Dropdown theme={theme} $isOpen={isOpen}>
        {options.map((option) => (
          <Option
            key={option.value}
            theme={theme}
            $isSelected={value.includes(option.value)}
            onClick={() => handleToggleOption(option.value)}
          >
            {option.label}
          </Option>
        ))}
      </Dropdown>
    </SelectContainer>
  );
};
