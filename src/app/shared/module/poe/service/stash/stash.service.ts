import { Injectable } from '@angular/core';
import { ClipboardService, KeyboardService, MouseService, WindowService } from '@app/service';
import { Point } from '@app/type';
import { Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { Currency } from '../../type';

export enum StashNavigationDirection {
    Left,
    Right
}

const GAME_HEIGHT_TO_STASH_WIDTH_RATIO = 1.622;

@Injectable({
    providedIn: 'root'
})
export class StashService {
    constructor(
        private readonly keyboard: KeyboardService,
        private readonly mouse: MouseService,
        private readonly window: WindowService,
        private readonly clipboard: ClipboardService) {
    }

    public hovering(point?: Point): boolean {
        point = point || this.mouse.position();

        const gameBounds = this.window.getBounds();

        const stashWidth = Math.round(gameBounds.height / GAME_HEIGHT_TO_STASH_WIDTH_RATIO);
        const relativePointX = point.x - gameBounds.x;

        return relativePointX >= 0 && relativePointX <= stashWidth;
    }

    public highlight(term: string): Observable<void> {
        const text = this.clipboard.readText();
        this.clipboard.writeText(`"${term}"`);
        this.keyboard.setKeyboardDelay(5);
        return of(null).pipe(
            tap(() => this.keyboard.keyTap('f', ['control'])),
            delay(175),
            tap(() => this.keyboard.keyTap('v', ['control'])),
            delay(75),
            tap(() => this.clipboard.writeText(text))
        );
    }

    public navigate(dir: StashNavigationDirection): void {
        this.keyboard.setKeyboardDelay(5);
        this.keyboard.keyTap(dir === StashNavigationDirection.Left ? 'left' : 'right');
    }

    public copyPrice(amount: number, currency: Currency): void {
        this.clipboard.writeText(`~price ${amount} ${currency.id}`);
    }

    public tagPrice(amount: number, currency: Currency, point: Point): Observable<void> {
        const text = this.clipboard.readText();
        this.copyPrice(amount, currency);
        return of(null).pipe(
            tap(() => this.mouse.click('right', point)),
            delay(100),
            tap(() => {
                this.keyboard.setKeyboardDelay(5);
                this.keyboard.keyTap('v', ['control']);
            }),
            delay(50),
            tap(() => {
                this.keyboard.setKeyboardDelay(5);
                this.keyboard.keyTap('enter');
            }),
            delay(75),
            tap(() => this.clipboard.writeText(text)),
        );
    }
}
