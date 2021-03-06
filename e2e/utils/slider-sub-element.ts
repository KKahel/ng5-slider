import { ElementFinder, browser, promise } from 'protractor';
import { ElementLocation } from './element-location';
import { ElementSize } from './element-size';

/** A wrapper for ElementFinder referring to slider's sub-element
 * It exposes a trimmed-down ElementFinder interface also extending
 * it with some other useful functions in context of testing
 * the slider component.
 */
export class SliderSubElement {
  constructor(private sliderElement: ElementFinder,
    private sliderSubElement: ElementFinder) {
  }

  isVisible(): promise.Promise<boolean> {
    return new promise.Promise<boolean>(
      (resolve: promise.IFulfilledCallback<boolean>,
       reject: promise.IRejectedCallback): void => {
        this.sliderSubElement.getCssValue('visibility').then(
          (value: string): void => {
            resolve(value === 'visible');
          },
          (error: any): void => {
            reject(error);
          });
      });
  }

  getText(): promise.Promise<string> {
    return this.sliderSubElement.getText();
  }

  /** Returns the sub-element's size */
  getSize(): promise.Promise<ElementSize> {
    return new promise.Promise<ElementSize>(
      (resolve: promise.IFulfilledCallback<ElementSize>,
       reject: promise.IRejectedCallback): void => {
        this.sliderSubElement.getSize().then(
          (size: any): void => {
            resolve({
              width: size.width,
              height: size.height
            });
          },
          (error: any): void => {
            reject(error);
          });
      });
  }

  /** Returns the sub-element's position relative to slider element, margins aside */
  getRelativeLocationWithoutMargins(): promise.Promise<ElementLocation> {
    return new promise.Promise<ElementLocation>(
      (resolve: promise.IFulfilledCallback<ElementLocation>,
       reject: promise.IRejectedCallback): void => {

        promise.all([
          this.sliderElement.getLocation() as promise.Promise<any>,
          this.sliderElement.getCssValue('margin-top') as promise.Promise<any>,
          this.sliderElement.getCssValue('margin-left') as promise.Promise<any>,
          this.sliderSubElement.getLocation() as promise.Promise<any>,
          this.sliderSubElement.getCssValue('margin-top') as promise.Promise<any>,
          this.sliderSubElement.getCssValue('margin-left') as promise.Promise<any>
        ])
        .then(
          (values: any[]): void => {
            const sliderLocation: ElementLocation = values[0];
            const sliderMarginTop: number = +values[1].replace('px', '');
            const sliderMarginLeft: number = +values[2].replace('px', '');
            const subElementLocation: ElementLocation = values[3];
            const subElementMarginTop: number = +values[4].replace('px', '');
            const subElementMarginLeft: number = +values[5].replace('px', '');

            resolve({
              x: (subElementLocation.x + subElementMarginLeft) - (sliderLocation.x - sliderMarginLeft),
              y: (subElementLocation.y + subElementMarginTop) - (sliderLocation.y - sliderMarginTop),
            });
          },
          (error: any): void => {
            reject(error);
          }
        );
      });
  }

  /** Simulates a mouse drag from the element's position to a given offset */
  mouseDrag(offsetX: number, offsetY: number): promise.Promise<void> {
    return browser.driver.actions()
      .mouseDown(this.sliderSubElement)
      .mouseMove({ x: offsetX, y: offsetY })
      .mouseUp()
      .perform();
  }

  /* Simulates a touch drag from the element's position to a given offset  */
  touchDrag(offsetX: number, offsetY: number): promise.Promise<void> {
    return new promise.Promise<void>(
      (resolve: promise.IFulfilledCallback<void>,
        reject: promise.IRejectedCallback): void => {

        this.sliderSubElement.getLocation().then(
          (location: any): void => {

            browser.driver.touchActions()
            .tapAndHold({ x: location.x, y: location.y })
            .move({ x: location.x + offsetX, y: location.y + offsetY })
            .release({ x: location.x + offsetX, y: location.y + offsetY })
            .perform()
            .then(() => {
                resolve(null);
              },
              (error: any): void => {
                reject(error);
              });
          },
          (error: any): void => {
            reject(error);
          });
      }
    );
  }

  mouseDragSync(offsetX: number, offsetY: number): void {
    browser.wait(this.mouseDrag(offsetX, offsetY));
  }

  touchDragSync(offsetX: number, offsetY: number): void {
    browser.wait(this.touchDrag(offsetX, offsetY));
  }

  sendKeys(...args: any[]): promise.Promise<void> {
    return this.sliderSubElement.sendKeys(...args);
  }
}
