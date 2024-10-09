export class ClickableInput
{
    private headerName: string;
    private element: HTMLElement;
    private popover!: HTMLDivElement;
    private input!: HTMLInputElement;
    private checkboxButton!: HTMLInputElement;
    private okButton!: HTMLButtonElement;
    private onSubmitCallback: (value: number, torches: boolean) => void;

    constructor(selector: string, onSubmit: (value: number, torched: boolean) => void, text: string, popoverWidth: string = '200px')
    {
        const element = document.querySelector(selector);
        if (!element || !(element instanceof HTMLElement))
        {
            throw new Error(`Element with selector "${selector}" not found or is not an HTMLElement`);
        }
        this.element = element;
        this.headerName = text;
        this.onSubmitCallback = onSubmit;
        this.createPopover(popoverWidth);
        this.addEventListeners();
    }

    private createPopover(width: string): void
    {
        this.popover = document.createElement('div');
        this.popover.classList.add('mass-editor-popover');
        this.popover.style.width = width;

        this.input = document.createElement('input');
        this.input.type = 'number';
        this.input.style.cssText = `
        margin-right: 5px;
        `;

        const header = document.createElement('div');
        header.innerText = `Set All ${this.headerName} to`;

        const flexDivOne = document.createElement('div');
        flexDivOne.style.display = "flex";
        flexDivOne.style.width = '100%';
        flexDivOne.style.placeContent = 'center';

        const flexDivTwo = document.createElement('div');
        flexDivTwo.style.display = "flex";
        flexDivTwo.style.width = '100%';
        flexDivTwo.style.placeContent = 'center';

        this.okButton = document.createElement('button');
        this.okButton.classList.add('popover-button');
        this.okButton.textContent = 'OK';
        this.okButton.style.width = '40px';

        const checkboxLabel = document.createElement('div');
        checkboxLabel.style.paddingLeft = "4px";
        checkboxLabel.style.paddingRight = "4px";
        checkboxLabel.textContent = "Include Torches:";

        this.checkboxButton = document.createElement('input');
        this.checkboxButton.type = 'checkbox';

        this.popover.appendChild(header);
        this.popover.appendChild(flexDivTwo);
        this.popover.appendChild(flexDivOne);

        flexDivTwo.appendChild(this.input);
        flexDivTwo.appendChild(this.okButton);

        flexDivOne.appendChild(checkboxLabel);
        flexDivOne.appendChild(this.checkboxButton);

        document.body.appendChild(this.popover);
    }

    private addEventListeners(): void
    {
        this.element.addEventListener('click', this.handleClick.bind(this));
        this.okButton.addEventListener('click', this.handleSubmit.bind(this));
        document.addEventListener('click', this.handleOutsideClick.bind(this));
    }

    private handleClick(event: MouseEvent): void
    {
        const rect = this.element.getBoundingClientRect();
        const { left, top } = this.calculatePopoverPosition(rect);

        this.popover.style.display = 'block';
        this.popover.style.left = `calc(50% - 100px)`;
        this.popover.style.top = `${top}px`;
        this.input.focus();
        event.stopPropagation();
    }

    private calculatePopoverPosition(elementRect: DOMRect): { left: number; top: number }
    {
        const popoverRect = this.popover.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let left = elementRect.left;
        let top = elementRect.top - popoverRect.height - 5;

        // Adjust horizontal position if it overflows the right edge
        if (left + popoverRect.width > viewportWidth)
        {
            left = viewportWidth - popoverRect.width - 50;
        }

        // Adjust vertical position if it overflows the top edge
        if (top < 0)
        {
            top = elementRect.bottom + 5;
        }

        return { left, top };
    }

    private handleSubmit(): void
    {
        const value = Number(this.input.value);
        const torched = this.checkboxButton.checked;
        if (!isNaN(value))
        {
            this.onSubmitCallback(value, torched);
            this.hidePopover();
        }
    }

    private handleOutsideClick(event: MouseEvent): void
    {
        if (event.target instanceof Node &&
            !this.popover.contains(event.target) &&
            event.target !== this.element)
        {
            this.hidePopover();
        }
    }

    private hidePopover(): void
    {
        this.popover.style.display = 'none';
        this.input.value = '';
    }
}