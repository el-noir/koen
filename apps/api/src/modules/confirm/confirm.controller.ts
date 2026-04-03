import { Controller, Patch, Param, Body, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ConfirmService } from './confirm.service';
import { UpdateExtractedDataDto } from './dto/update-confirm.dto';

const STAGE1_USER_ID = 'stage1-user';

@ApiTags('confirm')
@Controller('confirm')
export class ConfirmController {
  constructor(private readonly confirmService: ConfirmService) {}

  @Patch(':id')
  @ApiOperation({ summary: 'Confirm or update an extracted data item' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateExtractedDataDto,
  ) {
    return this.confirmService.update(id, dto, STAGE1_USER_ID);
  }
}
